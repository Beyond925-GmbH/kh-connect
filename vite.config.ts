import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // The kiosk loads once on the morning of the fair and then runs for hours.
      // `autoUpdate` means a redeploy is picked up without anyone touching the
      // iPad. The trade-off: the new worker can take over mid-session. That is
      // acceptable here only because no visitor state is meant to survive a
      // reset anyway (flow spec 5, "Kein Zustand überlebt einen Reset"). If a
      // mid-visit reload ever becomes a problem, switch to `prompt` — but that
      // needs an update-available UI, which does not exist yet.
      registerType: 'autoUpdate',

      // Keep the service worker out of the way while developing; a stale
      // precache during `pnpm dev` is far more confusing than it is useful.
      devOptions: { enabled: false },

      workbox: {
        // Everything the app can ship. `glb`/`gltf` are listed ahead of the 3D
        // model for B3.2; avif/webp ahead of the photo set (flow spec 8.5).
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,jpg,avif,webp,glb,gltf}'],

        // Workbox silently SKIPS files over this limit, which would leave the
        // one asset offline support exists for — the lazy `three` chunk plus a
        // ≤2 MB Draco model — uncached, and the failure only shows up when the
        // hall WLAN drops. The default of 2 MiB is too low for both.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,

        cleanupOutdatedCaches: true,

        // Single-page app: every route resolves to the shell.
        navigateFallback: 'index.html',

        runtimeCaching: [
          // Barlow currently comes from the Google Fonts CDN (see index.html),
          // so it is cross-origin and cannot be precached. These two rules make
          // it survive an outage after the first load.
          //
          // NOTE: this is the workaround, not the fix. Self-hosting the two
          // weights the design system actually uses (200 and 700) as subsetted
          // woff2 would remove a render-blocking third-party request and drop
          // the CDN from the offline story entirely.
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      manifest: {
        name: 'KHPL Connect — Zimmerer/Zimmerin',
        short_name: 'KHPL Connect',
        description:
          'Interaktive Messe-Anwendung der Kreishandwerkerschaft Paderborn-Lippe zum Ausbildungsberuf Zimmerer/Zimmerin.',
        lang: 'de',
        start_url: '/',
        // Kiosk: no browser chrome. iOS honours the equivalent meta tags in
        // index.html rather than this field.
        display: 'fullscreen',
        // Deliberately NOT locked: the app must work in portrait AND landscape
        // (flow spec 5, "Ausrichtung").
        background_color: '#FFFFFF',
        // Light is canonical at the kiosk; dark mode stays for web/school use.
        theme_color: '#FF9F2A',

        // TODO: square app icons are still missing. The only brand mark in the
        // repo is a 1000×248 wordmark, which cannot be cropped to a square
        // icon without a design decision. Needs 192×192 and 512×512 PNGs plus
        // one maskable 512×512. Until they exist the manifest is valid but the
        // app is not installable to the home screen — which is how the iPad is
        // meant to run it, so this blocks kiosk setup, not development.
        icons: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
