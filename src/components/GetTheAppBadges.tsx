import { useState } from "react";
import { Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import IOSInstallSheet from "@/components/IOSInstallSheet";
import badgeGooglePlay from "@/assets/badge-google-play.png";
import badgeAppStore from "@/assets/badge-app-store.png";

const trackBadgeClick = (badge: "google_play" | "app_store") => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "store_badge_click", { badge });
  }
};

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

  const badgeBtn =
    "block rounded-lg transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  const badges = (
    <div className="flex items-center gap-3">
      <button onClick={handleGooglePlay} className={badgeBtn} aria-label="Get it on Google Play">
        <img
          src={badgeGooglePlay}
          alt="Get it on Google Play"
          loading="lazy"
          className="h-11 w-auto rounded-lg sm:h-12"
          width={646}
          height={512}
        />
      </button>
      <button onClick={handleAppStore} className={badgeBtn} aria-label="Download on the App Store">
        <img
          src={badgeAppStore}
          alt="Download on the App Store"
          loading="lazy"
          className="h-11 w-auto rounded-lg sm:h-12"
          width={646}
          height={512}
        />
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
        {/* Decorative accent */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          {/* Left: icon + copy */}
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

          {/* Right: badges */}
          <div className="shrink-0">{badges}</div>
        </div>
      </div>

      <IOSInstallSheet open={pwa.iosSheetOpen || iosSheetOpen} onClose={closeSheet} />
    </>
  );
};

export default GetTheAppBadges;
