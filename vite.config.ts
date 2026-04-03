import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: mode === "development"
      ? {
          protocol: "wss",
          clientPort: 443,
          overlay: false,
        }
      : undefined,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "favicon-32x32.png", "favicon-192x192.png"],
      manifest: {
        name: "MRC GlobalPay — Instant Crypto Swaps",
        short_name: "MRC GlobalPay",
        description: "Swap 500+ cryptocurrencies instantly with zero confirmation delays. No registration required.",
        theme_color: "#00FFA3",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/favicon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/favicon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/, /^\/\.well-known/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.changenow\.io\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "changenow-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@radix-ui/react-accordion", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-popover", "@radix-ui/react-select", "@radix-ui/react-tooltip", "@radix-ui/react-tabs"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-helmet": ["react-helmet-async"],
          "vendor-motion": ["framer-motion"],
          "vendor-qr": ["qrcode.react"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
  },
}));
