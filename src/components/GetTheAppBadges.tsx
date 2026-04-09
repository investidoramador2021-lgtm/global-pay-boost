import { useState } from "react";
import { Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import IOSInstallSheet from "@/components/IOSInstallSheet";

const trackBadgeClick = (badge: "google_play" | "app_store") => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "store_badge_click", { badge });
  }
};

/* ---------- SVG-based badges for pixel-perfect rendering ---------- */

const GooglePlayBadge = ({ className = "" }: { className?: string }) => (
  <div
    className={`inline-flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground px-3.5 py-2 ${className}`}
  >
    {/* Play icon */}
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none">
      <path d="M3.5 20.5V3.5c0-.6.4-1 .8-.7l13.4 8.5c.4.3.4.8 0 1.1L4.3 21.2c-.4.3-.8 0-.8-.7z" fill="url(#gp)" />
      <defs>
        <linearGradient id="gp" x1="3.5" y1="3" x2="18" y2="12.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00C3FF" />
          <stop offset=".3" stopColor="#00E88F" />
          <stop offset=".6" stopColor="#FFCE00" />
          <stop offset="1" stopColor="#FF3A44" />
        </linearGradient>
      </defs>
    </svg>
    <div className="leading-none">
      <div className="font-body text-[9px] font-normal uppercase tracking-wider text-background/80">
        Get it on
      </div>
      <div className="font-display text-sm font-semibold text-background">
        Google Play
      </div>
    </div>
  </div>
);

const AppStoreBadge = ({ className = "" }: { className?: string }) => (
  <div
    className={`inline-flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground px-3.5 py-2 ${className}`}
  >
    {/* Apple icon */}
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor" style={{ color: "hsl(var(--background))" }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
    <div className="leading-none">
      <div className="font-body text-[9px] font-normal uppercase tracking-wider text-background/80">
        Download on the
      </div>
      <div className="font-display text-sm font-semibold text-background">
        App Store
      </div>
    </div>
  </div>
);

/* ---------- Main component ---------- */

interface GetTheAppBadgesProps {
  variant?: "section" | "inline";
}

const GetTheAppBadges = ({ variant = "section" }: GetTheAppBadgesProps) => {
  const pwa = usePWAInstall();
  const [iosSheetOpen, setIosSheetOpen] = useState(false);

  const handleGooglePlay = () => {
    trackBadgeClick("google_play");
    if (pwa.isAndroid || pwa.canInstall) {
      pwa.triggerInstall();
    } else {
      alert("Visit mrcglobalpay.com on your Android device to install the app.");
    }
  };

  const handleAppStore = () => {
    trackBadgeClick("app_store");
    if (pwa.isIOS) {
      pwa.triggerInstall();
    } else {
      setIosSheetOpen(true);
    }
  };

  const closeSheet = () => {
    pwa.setIosSheetOpen(false);
    setIosSheetOpen(false);
  };

  const badges = (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleGooglePlay}
        className="transition-transform duration-150 hover:scale-105 active:scale-[0.97]"
        aria-label="Get it on Google Play"
      >
        <GooglePlayBadge />
      </button>
      <button
        onClick={handleAppStore}
        className="transition-transform duration-150 hover:scale-105 active:scale-[0.97]"
        aria-label="Download on the App Store"
      >
        <AppStoreBadge />
      </button>
    </div>
  );

  if (variant === "inline") {
    return (
      <>
        {badges}
        <IOSInstallSheet open={pwa.iosSheetOpen || iosSheetOpen} onClose={closeSheet} />
      </>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] via-background to-primary/[0.04] shadow-[0_0_40px_hsl(var(--primary)/0.06)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Get the App
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Fast, secure &amp; offline-ready — install on any device
              </p>
            </div>
          </div>

          <div className="shrink-0">{badges}</div>
        </div>
      </div>

      <IOSInstallSheet open={pwa.iosSheetOpen || iosSheetOpen} onClose={closeSheet} />
    </>
  );
};

export default GetTheAppBadges;
