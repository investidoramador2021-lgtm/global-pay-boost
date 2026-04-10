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
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      manifestFilename: "manifest.json",
      includeAssets: ["favicon.png", "favicon-32x32.png", "favicon-192x192.png", "icon-512x512.png"],
      manifest: {
        id: "com.mrcglobalpay.app",
        name: "MRC Global Pay",
        short_name: "MRC Pay",
        description: "Swap 500+ cryptocurrencies instantly with zero confirmation delays. No registration required.",
        theme_color: "#00FFA3",
        background_color: "#0F1117",
        display: "standalone",
        orientation: "any",
        scope: "/",
        start_url: "/?utm_source=pwa&utm_medium=install",
        categories: ["finance", "business"],
        icons: [
          {
            src: "/favicon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshot-narrow.png",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow" as any,
            label: "MRC GlobalPay — Instant Crypto Swap",
          },
          {
            src: "/screenshot-wide.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide" as any,
            label: "MRC GlobalPay — Desktop Dashboard",
          },
        ],
        shortcuts: [
          {
            name: "Swap Crypto",
            short_name: "Swap",
            description: "Instantly swap 500+ cryptocurrencies",
            url: "/swap?utm_source=pwa_shortcut",
            icons: [{ src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "View Wallet",
            short_name: "Wallet",
            description: "Check your wallet and transaction history",
            url: "/wallet?utm_source=pwa_shortcut",
            icons: [{ src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" }],
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
