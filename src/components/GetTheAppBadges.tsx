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

  const badges = (
    <div className="flex items-center gap-3">
      <button
        onClick={handleGooglePlay}
        className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/80 backdrop-blur transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] active:scale-[0.97]"
        aria-label="Get it on Google Play"
      >
        <img
          src={badgeGooglePlay}
          alt="Get it on Google Play"
          loading="lazy"
          className="h-[44px] w-auto sm:h-[48px]"
          width={646}
          height={512}
        />
      </button>
      <button
        onClick={handleAppStore}
        className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/80 backdrop-blur transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] active:scale-[0.97]"
        aria-label="Download on the App Store"
      >
        <img
          src={badgeAppStore}
          alt="Download on the App Store"
          loading="lazy"
          className="h-[44px] w-auto sm:h-[48px]"
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
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-background to-primary/[0.04]">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
          {/* Icon + text */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.2)]">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
                Get the App
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Instant access on any device — fast, secure & offline-ready
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="shrink-0 sm:ml-auto">
            {badges}
          </div>
        </div>
      </div>

      <IOSInstallSheet open={pwa.iosSheetOpen || iosSheetOpen} onClose={closeSheet} />
    </>
  );
};

export default GetTheAppBadges;
