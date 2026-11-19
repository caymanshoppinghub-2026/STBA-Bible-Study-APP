import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type ProxyOptions } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const publishableKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';
  const supabaseUrl = (
    env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://ygsatsfcvodstgjhmths.supabase.co'
  ).replace(/\/+$/, '');

  const rawEdgeFunctionUrl = (
    env.VITE_SUPABASE_LIVE_EDGE_FUNCTION_URL ||
    env.VITE_SUPABASE_EDGE_FUNCTION_URL ||
    env.SUPABASE_EDGE_FUNCTION_URL ||
    process.env.VITE_SUPABASE_LIVE_EDGE_FUNCTION_URL ||
    process.env.VITE_SUPABASE_EDGE_FUNCTION_URL ||
    process.env.SUPABASE_EDGE_FUNCTION_URL ||
    `${supabaseUrl}/functions/v1/gemini-live-relay`
  ).trim();

  const normalizedEdgeCandidate = rawEdgeFunctionUrl.replace(
    /\/functions\/v1\/gemini-live(\b|\/|$)/i,
    '/functions/v1/gemini-live-relay'
  );
  const edgeFunctionUrl = /^https?:\/\/|^wss?:\/\//i.test(normalizedEdgeCandidate)
    ? normalizedEdgeCandidate.replace(/\/+$/, '')
    : `${supabaseUrl}/functions/v1/${normalizedEdgeCandidate
        .replace(/^\/+|\/+$/g, '')
        .replace(/^functions\/v1\//i, '')
        .replace(/^gemini-live$/i, 'gemini-live-relay') || 'gemini-live-relay'}`;

  // Target local Express backend directly (avoid external auth-bridge hairpinning inside container)
  const backendPort = Number(
    env.BACKEND_PORT ||
      env.PORT ||
      process.env.BACKEND_PORT ||
      process.env.PORT ||
      3000
  );
  const apiProxyTarget = (
    env.VITE_API_PROXY_TARGET ||
    env.BACKEND_URL ||
    process.env.VITE_API_PROXY_TARGET ||
    process.env.BACKEND_URL ||
    `http://127.0.0.1:${Number.isFinite(backendPort) && backendPort > 0 ? backendPort : 3000}`
  ).replace(/\/+$/, '');

  // When server.ts embeds Vite via middlewareMode, Express handles /api directly before vite.middlewares
  const isEmbeddedExpressVite = process.env.STBA_EMBEDDED_VITE === 'true';

  const attachApiProxyHandlers = (proxy: any, label: string) => {
    proxy.on('proxyReq', (proxyReq: any, req: any) => {
      if (req.headers?.authorization && !proxyReq.getHeader('authorization')) {
        proxyReq.setHeader('authorization', req.headers.authorization);
      }
      if (req.headers?.cookie && !proxyReq.getHeader('cookie')) {
        proxyReq.setHeader('cookie', req.headers.cookie);
      }
      if (req.headers?.host) {
        proxyReq.setHeader('x-forwarded-host', req.headers.host);
      }
    });

    proxy.on('error', (err: any, req: any, res: any) => {
      console.warn(`[Vite Proxy:${label}] Forwarding error for ${req?.url}:`, err?.message || err);
      if (res && typeof res.writeHead === 'function' && !res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
          JSON.stringify({
            ok: false,
            error: `Backend proxy unavailable (${label})`,
            details: err?.message || 'Upstream connection error',
          })
        );
      }
    });
  };

  const proxyRules: Record<string, string | ProxyOptions> = {
    '/api': {
      target: apiProxyTarget,
      changeOrigin: true,
      secure: false,
      ws: true,
      xfwd: true,
      configure: (proxy) => attachApiProxyHandlers(proxy, 'api'),
    },
    '/functions/v1': {
      target: supabaseUrl,
      changeOrigin: true,
      secure: true,
      ws: true,
      configure: (proxy) => attachApiProxyHandlers(proxy, 'supabase-functions'),
    },
  };

  return {
    base: '/',
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(publishableKey),
      'process.env.SUPABASE_PUBLISHABLE_KEY': JSON.stringify(publishableKey),
      'process.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(publishableKey),
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_EDGE_FUNCTION_URL': JSON.stringify(edgeFunctionUrl),
      'process.env.VITE_SUPABASE_EDGE_FUNCTION_URL': JSON.stringify(edgeFunctionUrl),
      'process.env.VITE_SUPABASE_LIVE_EDGE_FUNCTION_URL': JSON.stringify(edgeFunctionUrl),
      'import.meta.env.SUPABASE_PUBLISHABLE_KEY': JSON.stringify(publishableKey),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(publishableKey),
      'import.meta.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.SUPABASE_EDGE_FUNCTION_URL': JSON.stringify(edgeFunctionUrl),
      'import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL': JSON.stringify(edgeFunctionUrl),
      'import.meta.env.VITE_SUPABASE_LIVE_EDGE_FUNCTION_URL': JSON.stringify(edgeFunctionUrl),
    },
    plugins: [
      {
        name: 'stba-clean-html-and-credentials',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            // 1. Remove bare crossorigin attributes on local /assets/ tags so partitioned auth cookies are always sent
            let cleaned = html
              .replace(/<script\s+type="module"\s+crossorigin\s+src="\/assets\//g, '<script type="module" src="/assets/')
              .replace(/<link\s+rel="modulepreload"\s+crossorigin\s+href="\/assets\//g, '<link rel="modulepreload" href="/assets/')
              .replace(/<link\s+rel="stylesheet"\s+crossorigin\s+href="\/assets\//g, '<link rel="stylesheet" href="/assets/');

            // 2. Move any <script type="module" src="/assets/..."> injected in <head> to <body> after <div id="root"></div>
            // so </head> (_aistudio-iframe.js) and the body error guards execute before module evaluation
            const scriptMatch = cleaned.match(/<script\s+type="module"\s+src="\/assets\/[^"]+"><\/script>/);
            if (scriptMatch && cleaned.includes('<div id="root"></div>')) {
              const scriptTag = scriptMatch[0];
              cleaned = cleaned
                .replace(scriptTag, '')
                .replace('<div id="root"></div>', `<div id="root"></div>\n    ${scriptTag}`);
            }
            return cleaned;
          }
        }
      },
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    build: {
      emptyOutDir: false,
      cssCodeSplit: false,
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 6000,
    },
    server: {
      hmr: false,
      ws: false,
      watch: null,
      allowedHosts: true,
      ...(isEmbeddedExpressVite ? {} : { proxy: proxyRules }),
    },
    preview: {
      allowedHosts: true,
      proxy: proxyRules,
    },
  };
});
