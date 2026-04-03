import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App.tsx";

function clearPreviewServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const isPreviewHost =
    window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com");

  let isInIframe = false;
  try {
    isInIframe = window.self !== window.top;
  } catch {
    isInIframe = true;
  }

  if (!isPreviewHost && !isInIframe) {
    return;
  }

  void navigator.serviceWorker.getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
    .then(async () => {
      if (!("caches" in window)) return;
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    })
    .catch((error) => {
      console.warn("Preview service worker cleanup failed", error);
    });
}

clearPreviewServiceWorkers();

createRoot(document.getElementById("root")!).render(
  <App />
);
