import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icon-48.png',
        'icon-72.png',
        'icon-96.png',
        'icon-128.png',
        'icon-144.png',
        'icon-152.png',
        'icon-192.png',
        'icon-384.png',
        'icon-512.png',
        'apple-touch-icon.png',
      ],
      manifest: {
        name: 'Dinamiza Aula',
        short_name: 'DinamizaAula',
        description: 'Kit de dinamización del aula. Estrategias inteligentes para gestionar la participación.',
        theme_color: '#6366f1',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'any',
        scope: '/DinamizaAula/',
        start_url: '/DinamizaAula/',
        lang: 'es',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'icon-48.png', sizes: '48x48', type: 'image/png' },
          { src: 'icon-72.png', sizes: '72x72', type: 'image/png' },
          { src: 'icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: 'icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: 'icon-152.png', sizes: '152x152', type: 'image/png' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        screenshots: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  base: '/DinamizaAula/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
