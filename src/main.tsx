import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { scheduleAutoSeedCoreLibrary } from './lib/storage/autoSeedLibrary';

// Clean up any stale service workers and precaches that could serve outdated HTML/chunk hashes
if (typeof window !== 'undefined') {
  sessionStorage.removeItem('stba_stale_asset_reload');
  sessionStorage.removeItem('stba_stale_chunk_reload');
  sessionStorage.removeItem('stba_sw_purged');
  if (typeof (window as any).__stbaInstallErrorAndConsoleGuards === 'function') {
    (window as any).__stbaInstallErrorAndConsoleGuards();
  }

  const origParse = window.JSON && window.JSON.parse;
  if (origParse && !(window.JSON as any).__stbaSafeParse) {
    (window.JSON as any).__stbaSafeParse = true;
    window.JSON.parse = function (text: string, reviver?: any) {
      if (typeof text === 'string') {
        const trimmed = text.trim();
        if (trimmed.charAt(0) === '<') {
          return {};
        }
      }
      return origParse.call(window.JSON, text, reviver);
    };
  }

  if (window.Response && window.Response.prototype && !(window.Response.prototype as any).__stbaSafeJson) {
    (window.Response.prototype as any).__stbaSafeJson = true;
    window.Response.prototype.json = function () {
      return this.text().then((text) => {
        const trimmed = (text || '').trim();
        if (!trimmed || trimmed.charAt(0) === '<') {
          return { ok: false, error: 'Non-JSON response received' };
        }
        try {
          return origParse ? origParse.call(window.JSON, trimmed) : JSON.parse(trimmed);
        } catch {
          return { ok: false, error: 'Invalid JSON response' };
        }
      });
    };
  }

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    if (!sessionStorage.getItem('stba_preload_reloaded')) {
      sessionStorage.setItem('stba_preload_reloaded', '1');
      window.location.reload();
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }

  // Ensure initial out-of-the-box default voice is Elder Stephen (Gemini 3.8 Charon) across the entire app
  try {
    if (!localStorage.getItem('stba_ai_voice') || localStorage.getItem('stba_ai_voice') === 'Puck') {
      localStorage.setItem('stba_ai_voice', 'Charon');
    }
    if (!localStorage.getItem('stba_tts_engine')) {
      localStorage.setItem('stba_tts_engine', 'original');
    }
  } catch {}

  if ('caches' in window) {
    caches.keys().then((keys) => {
      for (const key of keys) {
        caches.delete(key).catch(() => {});
      }
    }).catch(() => {});
  }

  // Zero-click background caching of Core Adventist Library into IndexedDB
  scheduleAutoSeedCoreLibrary();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

