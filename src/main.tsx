import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App.tsx";

const PREVIEW_SW_RESET_KEY = "__lovable_preview_sw_reset__";

async function clearPreviewServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
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
    return false;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  const hadRegistrations = registrations.length > 0;

  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
  }

  if (hadRegistrations && !sessionStorage.getItem(PREVIEW_SW_RESET_KEY)) {
    sessionStorage.setItem(PREVIEW_SW_RESET_KEY, "1");
    window.location.reload();
    return true;
  }

  sessionStorage.removeItem(PREVIEW_SW_RESET_KEY);
  return false;
}

clearPreviewServiceWorkers()
  .catch((error) => {
    console.warn("Preview service worker cleanup failed", error);
    return false;
  })
  .then((didReload) => {
    if (didReload) return;

    createRoot(document.getElementById("root")!).render(
      <App />
    );
  });
