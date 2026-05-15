import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'autoUpdate' silently updates the service worker in the background
      registerType: 'autoUpdate',
      // Include the built assets in the precache so the app works offline
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'SpendWise Mini',
        short_name: 'SpendWise',
        description: 'Track your daily spending by category',
        theme_color: '#0a0618',
        background_color: '#0a0618',
        display: 'standalone',       // hides the browser bar when launched from home screen
        orientation: 'portrait',
        scope: '/personal-expense-tracker/',
        start_url: '/personal-expense-tracker/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable', // allows Android to apply adaptive icon shaping
          },
        ],
      },
      workbox: {
        // Cache all built JS/CSS/HTML assets so the app loads fully offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  base: '/personal-expense-tracker/',
})
