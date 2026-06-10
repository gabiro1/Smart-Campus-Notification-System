// vite.config.js
import { defineConfig } from "file:///D:/UR%20NOTES/YEAR%204/FINAL%20PROJECT/AI%20BASED%20EVENT%20ALERT%20AND%20REMINDER%20SYSTEM/Smart%20Campus%20Notification%20System/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/UR%20NOTES/YEAR%204/FINAL%20PROJECT/AI%20BASED%20EVENT%20ALERT%20AND%20REMINDER%20SYSTEM/Smart%20Campus%20Notification%20System/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/UR%20NOTES/YEAR%204/FINAL%20PROJECT/AI%20BASED%20EVENT%20ALERT%20AND%20REMINDER%20SYSTEM/Smart%20Campus%20Notification%20System/frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
import path from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "file:///D:/UR%20NOTES/YEAR%204/FINAL%20PROJECT/AI%20BASED%20EVENT%20ALERT%20AND%20REMINDER%20SYSTEM/Smart%20Campus%20Notification%20System/frontend/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///D:/UR%20NOTES/YEAR%204/FINAL%20PROJECT/AI%20BASED%20EVENT%20ALERT%20AND%20REMINDER%20SYSTEM/Smart%20Campus%20Notification%20System/frontend/vite.config.js";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      registerType: "autoUpdate",
      injectRegister: "inline",
      devOptions: {
        enabled: true,
        type: "module"
      },
      includeAssets: ["icons/icon-192x192.png", "icons/icon-512x512.png"],
      manifest: {
        id: "/",
        name: "UniNotify AI",
        short_name: "UniNotify AI",
        description: "AI-Based Event Alert and Reminder System",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
        categories: ["education", "productivity"],
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5e6
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  base: "/",
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth", "firebase/messaging"]
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 2500,
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/") || id.includes("node_modules/scheduler")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/react-router") || id.includes("node_modules/@remix-run")) {
            return "vendor-router";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "vendor-animations";
          }
          if (id.includes("node_modules/firebase")) {
            return "vendor-firebase";
          }
          if (id.includes("node_modules/recharts") || id.includes("node_modules/chart.js") || id.includes("node_modules/d3-")) {
            return "vendor-charts";
          }
          if (id.includes("node_modules/lucide-react") || id.includes("node_modules/@radix-ui") || id.includes("node_modules/cmdk") || id.includes("node_modules/vaul")) {
            return "vendor-ui";
          }
          if (id.includes("node_modules/@hello-pangea") || id.includes("node_modules/@dnd-kit")) {
            return "vendor-dnd";
          }
          if (id.includes("node_modules/socket.io-client") || id.includes("node_modules/@microsoft/signalr")) {
            return "vendor-realtime";
          }
          if (id.includes("node_modules/pdf-lib") || id.includes("node_modules/jspdf") || id.includes("node_modules/xlsx")) {
            return "vendor-documents";
          }
          if (id.includes("node_modules")) {
            return "vendor-other";
          }
        }
      }
    }
  },
  server: {
    port: 3e3,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://localhost:8000",
        changeOrigin: true
      }
    },
    allowedHosts: [
      "https://smart-campus-notification-system.vercel.app"
    ]
  },
  test: {
    globals: true,
    environment: "jsdom"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxVUiBOT1RFU1xcXFxZRUFSIDRcXFxcRklOQUwgUFJPSkVDVFxcXFxBSSBCQVNFRCBFVkVOVCBBTEVSVCBBTkQgUkVNSU5ERVIgU1lTVEVNXFxcXFNtYXJ0IENhbXB1cyBOb3RpZmljYXRpb24gU3lzdGVtXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxVUiBOT1RFU1xcXFxZRUFSIDRcXFxcRklOQUwgUFJPSkVDVFxcXFxBSSBCQVNFRCBFVkVOVCBBTEVSVCBBTkQgUkVNSU5ERVIgU1lTVEVNXFxcXFNtYXJ0IENhbXB1cyBOb3RpZmljYXRpb24gU3lzdGVtXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9VUiUyME5PVEVTL1lFQVIlMjA0L0ZJTkFMJTIwUFJPSkVDVC9BSSUyMEJBU0VEJTIwRVZFTlQlMjBBTEVSVCUyMEFORCUyMFJFTUlOREVSJTIwU1lTVEVNL1NtYXJ0JTIwQ2FtcHVzJTIwTm90aWZpY2F0aW9uJTIwU3lzdGVtL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSdcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCdcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcclxuXHJcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICB0YWlsd2luZGNzcygpLFxyXG5cclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICBzdHJhdGVnaWVzOiAnaW5qZWN0TWFuaWZlc3QnLFxyXG4gICAgICBzcmNEaXI6ICdzcmMnLFxyXG4gICAgICBmaWxlbmFtZTogJ3N3LmpzJyxcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgICAgIGluamVjdFJlZ2lzdGVyOiAnaW5saW5lJyxcclxuICAgICAgZGV2T3B0aW9uczoge1xyXG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgdHlwZTogJ21vZHVsZSdcclxuICAgICAgfSxcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydpY29ucy9pY29uLTE5MngxOTIucG5nJywgJ2ljb25zL2ljb24tNTEyeDUxMi5wbmcnXSxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBpZDogJy8nLFxyXG4gICAgICAgIG5hbWU6ICdVbmlOb3RpZnkgQUknLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdVbmlOb3RpZnkgQUknLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQUktQmFzZWQgRXZlbnQgQWxlcnQgYW5kIFJlbWluZGVyIFN5c3RlbScsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxyXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxyXG4gICAgICAgIHNjb3BlOiAnLycsXHJcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXHJcbiAgICAgICAgY2F0ZWdvcmllczogWydlZHVjYXRpb24nLCAncHJvZHVjdGl2aXR5J10sXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2ljb25zL2ljb24tMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pY29ucy9pY29uLTUxMng1MTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICBpbmplY3RNYW5pZmVzdDoge1xyXG4gICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA1MDAwMDAwXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgXSxcclxuXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGJhc2U6ICcvJyxcclxuXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbJ2ZpcmViYXNlL2FwcCcsICdmaXJlYmFzZS9hdXRoJywgJ2ZpcmViYXNlL21lc3NhZ2luZyddXHJcbiAgfSxcclxuXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDI1MDAsXHJcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0LWRvbScpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcmVhY3QvJykgfHwgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9zY2hlZHVsZXInKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1yZWFjdCc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9yZWFjdC1yb3V0ZXInKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0ByZW1peC1ydW4nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1yb3V0ZXInO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZnJhbWVyLW1vdGlvbicpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWFuaW1hdGlvbnMnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZmlyZWJhc2UnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1maXJlYmFzZSc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9yZWNoYXJ0cycpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvY2hhcnQuanMnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2QzLScpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWNoYXJ0cyc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3QnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0ByYWRpeC11aScpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvY21kaycpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdmF1bCcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXVpJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0BoZWxsby1wYW5nZWEnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0BkbmQta2l0JykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItZG5kJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0BtaWNyb3NvZnQvc2lnbmFscicpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXJlYWx0aW1lJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3BkZi1saWInKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2pzcGRmJykgfHwgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy94bHN4JykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItZG9jdW1lbnRzJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3Itb3RoZXInO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogMzAwMCxcclxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlXHJcbiAgICAgIH0sXHJcbiAgICAgICcvdXBsb2Fkcyc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgYWxsb3dlZEhvc3RzOiBbXHJcbiAgICAgIFwiaHR0cHM6Ly9zbWFydC1jYW1wdXMtbm90aWZpY2F0aW9uLXN5c3RlbS52ZXJjZWwuYXBwXCIsXHJcbiAgICBdXHJcbiAgfSxcclxuXHJcbiAgdGVzdDoge1xyXG4gICAgZ2xvYmFsczogdHJ1ZSxcclxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxyXG4gIH0sXHJcbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxlQUFlO0FBTm1VLElBQU0sMkNBQTJDO0FBUTVZLElBQU0sWUFBWSxLQUFLLFFBQVEsY0FBYyx3Q0FBZSxDQUFDO0FBRTdELElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUVaLFFBQVE7QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLFFBQVE7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLGNBQWM7QUFBQSxNQUNkLGdCQUFnQjtBQUFBLE1BQ2hCLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxRQUNULE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQSxlQUFlLENBQUMsMEJBQTBCLHdCQUF3QjtBQUFBLE1B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
