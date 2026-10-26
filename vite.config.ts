import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'suppress-vite-hmr-ws-error',
        transformIndexHtml: {
          order: 'pre',
          handler() {
            return [
              {
                tag: 'script',
                attrs: { type: 'text/javascript' },
                children: `
                  (function() {
                    if (typeof window === 'undefined') return;
                    var OrigWS = window.WebSocket;
                    if (OrigWS) {
                      window.WebSocket = function(url, protocols) {
                        var urlStr = String(url || '');
                        var isViteHmr = (protocols === 'vite-hmr') ||
                          (Array.isArray(protocols) && protocols.indexOf('vite-hmr') !== -1) ||
                          urlStr.indexOf('token=') !== -1 ||
                          urlStr.indexOf('@vite') !== -1;
                        if (isViteHmr) {
                          var listeners = {};
                          return {
                            readyState: 1,
                            OPEN: 1,
                            CONNECTING: 0,
                            CLOSING: 2,
                            CLOSED: 3,
                            url: urlStr,
                            protocol: 'vite-hmr',
                            extensions: '',
                            bufferedAmount: 0,
                            binaryType: 'blob',
                            send: function() {},
                            close: function() {},
                            addEventListener: function(type, fn) {
                              listeners[type] = listeners[type] || [];
                              listeners[type].push(fn);
                              if (type === 'open') {
                                setTimeout(function() {
                                  try { fn({ type: 'open' }); } catch(e) {}
                                }, 0);
                              }
                            },
                            removeEventListener: function(type, fn) {
                              if (!listeners[type]) return;
                              listeners[type] = listeners[type].filter(function(l) { return l !== fn; });
                            },
                            dispatchEvent: function() { return true; }
                          };
                        }
                        return new OrigWS(url, protocols);
                      };
                      window.WebSocket.prototype = OrigWS.prototype;
                      window.WebSocket.CONNECTING = 0;
                      window.WebSocket.OPEN = 1;
                      window.WebSocket.CLOSING = 2;
                      window.WebSocket.CLOSED = 3;
                    }
                    window.addEventListener('unhandledrejection', function(event) {
                      if (event && event.reason && typeof event.reason.message === 'string' &&
                          (event.reason.message.indexOf('WebSocket closed without opened') !== -1 ||
                           event.reason.message.indexOf('vite:ws') !== -1)) {
                        event.preventDefault();
                        event.stopPropagation();
                      }
                    });
                    window.addEventListener('error', function(event) {
                      if (event && event.message && typeof event.message === 'string' &&
                          (event.message.indexOf('WebSocket closed without opened') !== -1 ||
                           event.message.indexOf('vite:ws') !== -1)) {
                        event.preventDefault();
                        event.stopPropagation();
                      }
                    });
                  })();
                `,
                injectTo: 'head-prepend'
              }
            ];
          }
        }
      },
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'icon.svg',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png'
        ],
        manifest: {
          id: '/',
          name: 'Study To Be Approved (STBA)',
          short_name: 'STBA',
          description: 'Cognitive Scripture Mastery & SDA Doctrinal Training Platform',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#06162c',
          theme_color: '#06162c',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}', 'pwa-*.png', 'apple-touch-icon.png'],
          runtimeCaching: [
            {
              // Cache Google Fonts Stylesheets
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cache Google Fonts Webfonts
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cache Scripture Bible API Proxy - Offline-First with NetworkFirst Fallback
              urlPattern: /\/api\/bible.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'stba-bible-api-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 60 // 60 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cache Seventh-day Adventist Bible Commentary (SDABC) API
              urlPattern: /\/api\/study\/sdabc-commentary.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'stba-sdabc-commentary-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 60 // 60 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cache Topical Tracks, Word Studies, and Study Tools
              urlPattern: /\/api\/study\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'stba-study-content-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 300,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Public Bible API Fallback (bible-api.com)
              urlPattern: /^https:\/\/bible-api\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'public-bible-api-cache',
                expiration: {
                  maxEntries: 300,
                  maxAgeSeconds: 60 * 60 * 24 * 60
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cloudinary brand images
              urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'stba-cloudinary-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 90
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});
