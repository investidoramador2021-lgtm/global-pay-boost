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
      devOptions: { enabled: false },
      strategies: "generateSW",
      injectRegister: "script",
      manifestFilename: "manifest.json",
      includeAssets: ["favicon.png", "favicon-32x32.png", "favicon-192x192.png", "icon-512x512.png"],
      manifest: {
        id: "com.mrcglobalpay.app",
        name: "MRC GlobalPay",
        short_name: "MRC Pay",
        description: "Instant crypto swaps with no minimum. Swap dust from $0.30. Non-custodial wallet-to-wallet exchange for 500+ cryptocurrencies.",
        theme_color: "#FFD700",
        background_color: "#000000",
        display: "standalone",
        orientation: "any",
        scope: "/",
        start_url: "/",
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
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/\.well-known/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,json,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.changenow\.io\/.*/i,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
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
                maxAgeSeconds: 60 * 60 * 24 * 7,
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
