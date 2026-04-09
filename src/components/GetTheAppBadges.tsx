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
  /** "section" renders a titled block; "inline" renders just the badges */
  variant?: "section" | "inline";
}

const GetTheAppBadges = ({ variant = "section" }: GetTheAppBadgesProps) => {
  const pwa = usePWAInstall();
  const [iosSheetOpen, setIosSheetOpen] = useState(false);

  const handleGooglePlay = () => {
    trackBadgeClick("google_play");
    if (pwa.isAndroid) {
      pwa.triggerInstall();
    } else {
      // Desktop — trigger PWA install if available, otherwise show message
      if (pwa.canInstall) {
        pwa.triggerInstall();
      } else {
        alert("Visit mrcglobalpay.com on your Android device to install the app.");
      }
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

  const badges = (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
      <button
        onClick={handleGooglePlay}
        className="transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        aria-label="Get it on Google Play"
      >
        <img
          src={badgeGooglePlay}
          alt="Get it on Google Play"
          loading="lazy"
          className="h-10 w-auto sm:h-11"
          width={646}
          height={512}
        />
      </button>
      <button
        onClick={handleAppStore}
        className="transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        aria-label="Download on the App Store"
      >
        <img
          src={badgeAppStore}
          alt="Download on the App Store"
          loading="lazy"
          className="h-10 w-auto sm:h-11"
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
        <IOSInstallSheet open={pwa.iosSheetOpen || iosSheetOpen} onClose={() => { pwa.setIosSheetOpen(false); setIosSheetOpen(false); }} />
      </>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-muted/30 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">Get the App</h3>
            <p className="font-body text-xs text-muted-foreground">
              Install MRC GlobalPay for instant access on any device
            </p>
          </div>
        </div>
        {badges}
      </div>
      <IOSInstallSheet open={pwa.iosSheetOpen || iosSheetOpen} onClose={() => { pwa.setIosSheetOpen(false); setIosSheetOpen(false); }} />
    </>
  );
};

export default GetTheAppBadges;
