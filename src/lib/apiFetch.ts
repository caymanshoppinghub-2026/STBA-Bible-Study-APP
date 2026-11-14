/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SUPABASE_URL, supabase } from "./supabase.ts";

export interface ApiFetchOptions extends RequestInit {
  /** Whether to attach the active Supabase Bearer access token (defaults to true for API/Supabase requests) */
  attachAuthToken?: boolean;
  /** Maximum number of same-origin redirects to manually follow (defaults to 1, never follows cross-origin auth redirects) */
  maxSameOriginRedirects?: number;
}

/**
 * Determines the raw URL string from a RequestInfo | URL input.
 */
function resolveRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (typeof URL !== "undefined" && input instanceof URL) return input.toString();
  if (typeof Request !== "undefined" && input instanceof Request) return input.url;
  return String(input || "");
}

/**
 * Returns true if the target URL uses cookie-based proxy/session credentials
 * (same-origin `/api/*`, relative routes, `aistudio.google.com`, `*.run.app`).
 * Does NOT return true for wildcard-CORS APIs (`*.supabase.co`, `bible-api.com`, external workers)
 * where `credentials: "include"` would fail browser CORS checks against `Access-Control-Allow-Origin: *`.
 */
export function isCredentialedApiUrl(rawUrl: string): boolean {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) return false;

  // Relative URLs (such as `/api/user/study-notebook`) are always same-origin
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  try {
    const base =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://localhost";
    const parsed = new URL(trimmed, base);

    if (typeof window !== "undefined" && window.location?.origin && parsed.origin === window.location.origin) {
      return true;
    }

    const host = parsed.hostname.toLowerCase();
    if (
      host.endsWith(".aistudio.google.com") ||
      host === "aistudio.google.com" ||
      host.endsWith(".run.app")
    ) {
      return true;
    }

    return false;
  } catch {
    return trimmed.startsWith("/api");
  }
}

/**
 * Returns true if the URL targets our Supabase project or Edge Functions,
 * which use `Authorization: Bearer` headers and manual redirect protection
 * without `credentials: "include"`.
 */
export function isSupabaseApiUrl(rawUrl: string): boolean {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed || (trimmed.startsWith("/") && !trimmed.startsWith("//"))) return false;

  try {
    const base =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://localhost";
    const parsed = new URL(trimmed, base);

    if (SUPABASE_URL) {
      try {
        const sbOrigin = new URL(SUPABASE_URL).origin;
        if (parsed.origin === sbOrigin) return true;
      } catch {
        // ignore invalid SUPABASE_URL
      }
    }

    return parsed.hostname.toLowerCase().endsWith(".supabase.co");
  } catch {
    return false;
  }
}

/**
 * Checks whether a fetch Response represents an intercepted background redirect
 * (such as an auth-bridge 302 returned as opaqueredirect under `redirect: "manual"`).
 */
export function isAuthRedirectResponse(response: Response | null | undefined): boolean {
  if (!response) return false;
  return (
    response.type === "opaqueredirect" ||
    response.status === 0 ||
    (response.status >= 300 && response.status < 400) ||
    response.headers.get("X-STBA-Auth-Redirect") === "1"
  );
}

/**
 * Reads the current Supabase access_token synchronously from localStorage when available,
 * falling back to `supabase.auth.getSession()` when needed.
 */
async function getBearerAccessToken(): Promise<string | null> {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              const token = parsed?.access_token || parsed?.currentSession?.access_token;
              if (typeof token === "string" && token.trim().length > 0) {
                return token.trim();
              }
            } catch {
              // ignore parse failure
            }
          }
        }
      }
    }
  } catch {
    // ignore storage access issues
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return String(session.access_token).trim();
    }
  } catch {
    // non-fatal
  }

  return null;
}

/**
 * Creates a clean, non-throwing JSON Response when a cross-origin auth-bridge redirect
 * is intercepted in the background. Prevents callers from crashing on `opaqueredirect`
 * or `SyntaxError` when calling `.json()`.
 */
function buildRedirectBlockedResponse(targetUrl: string, redirectLocation?: string | null): Response {
  const payload = {
    ok: false,
    success: false,
    authRedirect: true,
    status: 401,
    targetUrl,
    ...(redirectLocation ? { redirectLocation } : {}),
    error: "Background auth redirect intercepted; credentials preserved without cross-domain token stripping."
  };

  return new Response(JSON.stringify(payload), {
    status: 401,
    statusText: "Auth Redirect Intercepted",
    headers: {
      "Content-Type": "application/json",
      "X-STBA-Auth-Redirect": "1"
    }
  });
}

function buildNetworkFallbackResponse(url: string, errorMessage?: string): Response {
  const payload = JSON.stringify({
    ok: false,
    success: false,
    networkOffline: true,
    interceptedUrl: url,
    error: errorMessage || "Network request temporarily unavailable."
  });

  return new Response(payload, {
    status: 422,
    statusText: "Network Fallback",
    headers: {
      "Content-Type": "application/json",
      "X-STBA-Network-Fallback": "1"
    }
  });
}

function attachSafeJsonMethod(response: Response): Response {
  try {
    Object.defineProperty(response, "json", {
      configurable: true,
      writable: true,
      value: async () => {
        const parsed = await safeParseResponseJson<any>(response);
        return parsed !== null ? parsed : { ok: false, success: false, error: "Non-JSON response intercepted safely" };
      }
    });
  } catch {
    // non-fatal if Response object is sealed
  }
  return response;
}

/**
 * Hardened `fetch` wrapper for all backend and cross-domain API requests:
 * - Enforces `credentials: "include"` on same-origin & AI Studio proxy URLs so cookies are never stripped
 * - Enforces `redirect: "manual"` on protected/Supabase calls so background auth-bridge `302` redirects
 *   do not convert POST->GET with `Origin: null` and hit `403 Forbidden` on `applet-auth-bridge`
 * - Preserves caller headers and automatically forwards active Supabase `Authorization: Bearer` tokens
 * - Gracefully handles transient network / iframe proxy interruptions without throwing `TypeError: Failed to fetch`
 */
export async function apiFetch(input: RequestInfo | URL, init: ApiFetchOptions = {}): Promise<Response> {
  const resolvedUrl = resolveRequestUrl(input);
  const credentialed = isCredentialedApiUrl(resolvedUrl);
  const supabaseTarget = isSupabaseApiUrl(resolvedUrl);
  const protectedTarget = credentialed || supabaseTarget;

  const {
    attachAuthToken = true,
    maxSameOriginRedirects = 1,
    ...fetchInit
  } = init;

  const headers = new Headers(
    fetchInit.headers || (typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined)
  );

  if (protectedTarget && attachAuthToken && !headers.has("Authorization")) {
    const token = await getBearerAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const requestInit: RequestInit = {
    ...fetchInit,
    headers,
    credentials: credentialed ? (fetchInit.credentials || "include") : fetchInit.credentials,
    redirect: protectedTarget ? (fetchInit.redirect || "manual") : fetchInit.redirect
  };

  let currentInput: RequestInfo | URL = input;
  let hops = 0;

  while (true) {
    let response: Response;
    try {
      response = await fetch(currentInput, requestInit);
    } catch (firstErr: any) {
      // In some iframe proxy environments, `redirect: "manual"` can trigger a fetch rejection.
      // Retry once with standard redirect handling before returning a synthetic JSON fallback response.
      if (requestInit.redirect === "manual") {
        try {
          response = await fetch(currentInput, {
            ...requestInit,
            redirect: "follow"
          });
        } catch (retryErr: any) {
          return attachSafeJsonMethod(buildNetworkFallbackResponse(resolvedUrl, retryErr?.message || firstErr?.message));
        }
      } else {
        return attachSafeJsonMethod(buildNetworkFallbackResponse(resolvedUrl, firstErr?.message));
      }
    }

    if (!protectedTarget) {
      return attachSafeJsonMethod(response);
    }

    // Intercept opaque cross-origin redirects (browser strips Location for security)
    if (response.type === "opaqueredirect" || response.status === 0) {
      return attachSafeJsonMethod(buildRedirectBlockedResponse(resolvedUrl));
    }

    // Handle explicit 3xx redirects when exposed (e.g., same-origin redirect)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location");
      const isAuthBridge = Boolean(location && location.includes("applet-auth-bridge"));

      if (isAuthBridge || !location || hops >= maxSameOriginRedirects) {
        return attachSafeJsonMethod(buildRedirectBlockedResponse(resolvedUrl, location));
      }

      // Only follow explicitly safe same-origin redirects while keeping credentials & headers intact
      try {
        const baseOrigin = typeof window !== "undefined" ? window.location.origin : "https://localhost";
        const nextUrl = new URL(location, baseOrigin);
        if (nextUrl.origin === baseOrigin && !nextUrl.href.includes("applet-auth-bridge")) {
          hops += 1;
          currentInput = nextUrl.toString();
          continue;
        }
      } catch {
        // invalid redirect URL -> block safely
      }

      return attachSafeJsonMethod(buildRedirectBlockedResponse(resolvedUrl, location));
    }

    return attachSafeJsonMethod(response);
  }
}

/**
 * Safely parses JSON from a Fetch Response without throwing `SyntaxError`
 * when an upstream proxy or auth bridge returns HTML (`<!doctype ...`).
 */
export async function safeParseResponseJson<T = any>(response: Response | null | undefined): Promise<T | null> {
  if (!response || isAuthRedirectResponse(response)) {
    return null;
  }
  try {
    const raw = await response.text();
    const trimmed = (raw || "").trim();
    if (!trimmed || trimmed.charAt(0) === "<") {
      return null;
    }
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

/**
 * Convenience wrapper over `apiFetch` that safely parses JSON and returns a structured result.
 */
export async function apiFetchJson<T = any>(
  input: RequestInfo | URL,
  init: ApiFetchOptions = {}
): Promise<{ ok: boolean; status: number; authRedirect?: boolean; data?: T; error?: string }> {
  try {
    const response = await apiFetch(input, init);
    const authRedirect = isAuthRedirectResponse(response);
    const data = await safeParseResponseJson<any>(response);

    if (!response.ok || authRedirect) {
      return {
        ok: false,
        status: response.status,
        authRedirect: authRedirect || Boolean(data?.authRedirect),
        data: data ?? undefined,
        error: data?.error || `HTTP ${response.status} ${response.statusText}`
      };
    }

    return {
      ok: true,
      status: response.status,
      data: data as T
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err?.message || "Network request failed"
    };
  }
}
