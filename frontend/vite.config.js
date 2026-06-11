/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: ['icons/icon-192x192.png', 'icons/icon-512x512.png', 'icons/icon-1024x1024.png'],
      manifest: {
        id: '/',
        name: 'UniNotify AI',
        short_name: 'UniNotify AI',
        description: 'AI-Based Event Alert and Reminder System',
        theme_color: '#0a0a1a',
        background_color: '#0a0a1a',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-1024x1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        splash_pages: null
      },
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5000000
      }
    })
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  base: '/',

  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/messaging']
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2500,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-animations';
          }
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/chart.js') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/@radix-ui') || id.includes('node_modules/cmdk') || id.includes('node_modules/vaul')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/@hello-pangea') || id.includes('node_modules/@dnd-kit')) {
            return 'vendor-dnd';
          }
          if (id.includes('node_modules/socket.io-client') || id.includes('node_modules/@microsoft/signalr')) {
            return 'vendor-realtime';
          }
          if (id.includes('node_modules/pdf-lib') || id.includes('node_modules/jspdf') || id.includes('node_modules/xlsx')) {
            return 'vendor-documents';
          }
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
        }
      }
    }
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    },
    allowedHosts: [
      "https://smart-campus-notification-system.vercel.app",
    ]
  },

  test: {
    globals: true,
    environment: 'jsdom',
  },
})