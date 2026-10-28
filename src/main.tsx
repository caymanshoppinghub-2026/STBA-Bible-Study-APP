import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { Analytics } from '@vercel/analytics/react';

// Register service worker for offline Scripture study content caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegistered(registration) {
      if (registration) {
        console.log('[STBA PWA] Service Worker registered for offline study caching');
      }
    },
    onRegisterError(error) {
      console.warn('[STBA PWA] Service Worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
