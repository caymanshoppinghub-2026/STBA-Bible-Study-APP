import { createClient } from '@supabase/supabase-js'

const rawUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
  "https://ygsatsfcvodstgjhmths.supabase.co"

// Clean up standard trailing REST API routes so supabase-js SDK and Edge Function URLs resolve accurately
export const SUPABASE_URL = String(rawUrl).replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '').trim()

export const SUPABASE_PUBLISHABLE_KEY = String(
  (typeof import.meta !== 'undefined' && (
    import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env?.SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env?.VITE_SUPABASE_ANON_KEY
  )) ||
  (typeof process !== 'undefined' && (
    process.env?.SUPABASE_PUBLISHABLE_KEY ||
    process.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env?.VITE_SUPABASE_ANON_KEY ||
    process.env?.SUPABASE_ANON_KEY
  )) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnc2F0c2Zjdm9kc3RnamhtdGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0ODQxNzUsImV4cCI6MjA5NzA2MDE3NX0.Tc4-IvWSmqADtYd2E5_ja3s3V4-lQ9NU51mjST1sbEU"
).trim()

/**
 * Ensures any Edge Function target (slug, relative '/functions/v1/...', or full URL)
 * always resolves to a complete absolute URL using SUPABASE_URL (VITE_SUPABASE_URL)
 * and targets the deployed 'gemini-live-relay' endpoint rather than making a relative request.
 */
export function resolveSupabaseEdgeFunctionUrl(
  rawTarget?: string,
  defaultFunctionSlug: string = 'gemini-live-relay'
): string {
  const baseSupabaseUrl = SUPABASE_URL.replace(/\/+$/, '')
  const candidate = String(rawTarget || '').trim()

  if (!candidate) {
    return `${baseSupabaseUrl}/functions/v1/${defaultFunctionSlug}`
  }

  // Upgrade legacy 'gemini-live' slug/path to the active 'gemini-live-relay' Edge Function
  const normalizedCandidate = candidate.replace(/\/functions\/v1\/gemini-live(\b|\/|$)/i, '/functions/v1/gemini-live-relay')

  if (/^https?:\/\/|^wss?:\/\//i.test(normalizedCandidate)) {
    try {
      const parsed = new URL(normalizedCandidate)
      // If a same-origin container URL was accidentally constructed for /functions/v1/*, rewrite host to SUPABASE_URL
      if (
        typeof window !== 'undefined' &&
        parsed.host === window.location.host &&
        parsed.pathname.startsWith('/functions/v1/')
      ) {
        return `${baseSupabaseUrl}${parsed.pathname}${parsed.search}`
      }
      return normalizedCandidate.replace(/\/+$/, '')
    } catch {
      return normalizedCandidate.replace(/\/+$/, '')
    }
  }

  // Handle relative paths like '/functions/v1/gemini-live-relay' or 'functions/v1/gemini-live-relay' without doubling '/functions/v1/'
  const cleanRelative = normalizedCandidate.replace(/^\/+|\/+$/g, '')
  const slug = cleanRelative
    .replace(/^functions\/v1\//i, '')
    .replace(/^gemini-live$/i, 'gemini-live-relay')

  return `${baseSupabaseUrl}/functions/v1/${slug || defaultFunctionSlug}`
}

const rawEdgeFunctionUrl =
  (typeof import.meta !== 'undefined' && (
    import.meta.env?.VITE_SUPABASE_LIVE_EDGE_FUNCTION_URL ||
    import.meta.env?.VITE_SUPABASE_EDGE_FUNCTION_URL ||
    import.meta.env?.SUPABASE_EDGE_FUNCTION_URL
  )) ||
  (typeof process !== 'undefined' && (
    process.env?.VITE_SUPABASE_LIVE_EDGE_FUNCTION_URL ||
    process.env?.VITE_SUPABASE_EDGE_FUNCTION_URL ||
    process.env?.SUPABASE_EDGE_FUNCTION_URL
  )) ||
  `${SUPABASE_URL}/functions/v1/gemini-live-relay`

export const SUPABASE_EDGE_FUNCTION_URL = resolveSupabaseEdgeFunctionUrl(String(rawEdgeFunctionUrl), 'gemini-live-relay')
export const GEMINI_LIVE_RELAY_URL = SUPABASE_EDGE_FUNCTION_URL

if (typeof window !== 'undefined') {
  console.log('[Supabase Config] VITE_SUPABASE_URL:', SUPABASE_URL)
  console.log('[Supabase Config] gemini-live-relay endpoint:', SUPABASE_EDGE_FUNCTION_URL)
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

/**
 * Structured study context query parameters for the Gemini Live Bible study WebSocket session.
 */
export interface StudyContextQueryParams {
  mode?: 'study' | 'teach' | string
  model?: string
  persona?: string
  reference?: string
  passageText?: string
  topic?: string
  userName?: string
  doctrineId?: string
  lessonId?: string
  [key: string]: string | undefined
}

/**
 * Converts a Supabase Edge Function URL into a secure WebSocket (`wss://`) endpoint
 * and appends the structured Bible study context query parameters.
 *
 * @param studyContext - Study context parameters (reference, passageText, topic, userName, mode, persona, model, etc.) or URLSearchParams
 * @param edgeFunctionUrlOrName - Optional full Edge Function URL or function slug (defaults to SUPABASE_EDGE_FUNCTION_URL / 'gemini-live-relay')
 * @returns Complete `wss://` WebSocket endpoint URL with encoded study context query parameters
 */
export function buildSupabaseLiveWebSocketUrl(
  studyContext?: StudyContextQueryParams | URLSearchParams,
  edgeFunctionUrlOrName?: string
): string {
  // Always resolve to a full absolute URL anchored at SUPABASE_URL (never a relative request)
  const baseHttpUrl = resolveSupabaseEdgeFunctionUrl(
    edgeFunctionUrlOrName || SUPABASE_EDGE_FUNCTION_URL,
    'gemini-live-relay'
  )

  // Convert the Supabase HTTP/HTTPS endpoint into a valid wss:// address
  let secureWsBase: string
  try {
    const parsedUrl = new URL(baseHttpUrl)
    parsedUrl.protocol = 'wss:'
    parsedUrl.search = ''
    parsedUrl.hash = ''
    secureWsBase = parsedUrl.toString().replace(/\/+$/, '')
  } catch {
    secureWsBase = baseHttpUrl
      .replace(/^https?:\/\//i, 'wss://')
      .replace(/^ws:\/\//i, 'wss://')
      .split('?')[0]
      .replace(/\/+$/, '')
  }

  const entries: Array<[string, string]> = []

  if (studyContext instanceof URLSearchParams) {
    studyContext.forEach((value, key) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        entries.push([key, String(value).trim()])
      }
    })
  } else if (studyContext && typeof studyContext === 'object') {
    const mergedContext: Record<string, string | undefined> = {
      mode: studyContext.mode || 'study',
      model: studyContext.model || 'gemini-3.8-live',
      persona: studyContext.persona || 'Elder Stephen',
      ...studyContext
    }

    for (const [key, val] of Object.entries(mergedContext)) {
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        entries.push([key, String(val).trim()])
      }
    }
  }

  if (entries.length === 0) return secureWsBase

  const encodedQueryString = entries
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    .join('&')

  return `${secureWsBase}?${encodedQueryString}`
}

/**
 * Alias for converting the configured Supabase Edge Function URL into a secure wss:// endpoint
 * with appended study context query parameters.
 */
export function getSupabaseEdgeFunctionWsUrl(
  queryParams?: StudyContextQueryParams | URLSearchParams,
  functionName: string = 'gemini-live-relay'
): string {
  const customUrl =
    (typeof import.meta !== 'undefined' && (
      import.meta.env?.VITE_SUPABASE_LIVE_EDGE_FUNCTION_URL ||
      import.meta.env?.VITE_SUPABASE_EDGE_FUNCTION_URL
    )) ||
    `${SUPABASE_URL}/functions/v1/${functionName}`

  return buildSupabaseLiveWebSocketUrl(queryParams, String(customUrl))
}

/**
 * Retrieves the user's complete session access_token without any truncation for the Sec-WebSocket-Protocol header.
 */
export async function getUntruncatedSessionToken(): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      return String(session.access_token).trim()
    }
  } catch (err) {
    console.warn('[Supabase Auth] Unable to read session token, falling back to publishable key:', err)
  }
  return SUPABASE_PUBLISHABLE_KEY
}
