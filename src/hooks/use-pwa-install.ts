import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIOS = () => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

const isStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
};

const trackInstallEvent = (platform: "android" | "ios") => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "pwa_install_click", { platform });
  }
};

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidInstall, setShowAndroidInstall] = useState(false);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [iosSheetOpen, setIosSheetOpen] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    // Android / Chrome — capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS — show manual instructions
    if (isIOS() && !isStandalone()) {
      setShowIOSInstall(true);
    }

    // Track successful installs
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowAndroidInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const triggerAndroidInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    trackInstallEvent("android");
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setShowAndroidInstall(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const triggerIOSInstall = useCallback(() => {
    trackInstallEvent("ios");
    setIosSheetOpen(true);
  }, []);

  const canInstall = !installed;

  return {
    canInstall,
    installed,
    isIOS: showIOSInstall,
    isAndroid: showAndroidInstall,
    triggerInstall: showIOSInstall ? triggerIOSInstall : triggerAndroidInstall,
    iosSheetOpen,
    setIosSheetOpen,
  };
};
