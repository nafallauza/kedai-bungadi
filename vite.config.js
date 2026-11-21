import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA: halaman tetap terbuka saat sinyal di kedai hilang, dan kasir bisa memasangnya sebagai aplikasi.
    // Service worker hanya aktif di HTTPS atau localhost, dan hanya pada hasil build (npm run build && npm run preview).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Wedang Uwuh Bu Ngadi',
        short_name: 'Bu Ngadi',
        description: 'Pesan wedang uwuh dan makanan langsung dari meja lewat QR code.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#15110d',
        background_color: '#15110d',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Tekan lama ikon aplikasi di tablet kasir untuk langsung ke halaman staf
        shortcuts: [
          { name: 'Kasir & Dapur', url: '/kasir' },
          { name: 'Admin', url: '/admin' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/images/'),
            handler: 'CacheFirst',
            options: { cacheName: 'foto', expiration: { maxEntries: 60 } },
          },
          // Untuk backend nanti: menu & data lain tetap tampil dari cache saat offline.
          // Mengirim pesanan (POST) tidak pernah di-cache.
          {
            urlPattern: ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'GET',
            handler: 'NetworkFirst',
            options: { cacheName: 'api', networkTimeoutSeconds: 4 },
          },
        ],
      },
    }),
  ],
  server: {
    // host: true agar halaman bisa dibuka dari HP di jaringan yang sama (untuk uji scan QR)
    host: true,
    port: 5173,
  },
});
