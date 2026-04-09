import { Smartphone, Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import IOSInstallSheet from "@/components/IOSInstallSheet";

const PWAInstallCard = () => {
  const { canInstall, triggerInstall, isIOS, iosSheetOpen, setIosSheetOpen } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <>
      <button
        onClick={triggerInstall}
        className="group flex w-full items-center gap-4 rounded-2xl border border-primary/20 bg-primary/[0.06] p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/[0.1] active:scale-[0.98]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-semibold text-foreground">Install App</div>
          <div className="font-body text-xs text-muted-foreground">
            {isIOS ? "Add to Home Screen for the best experience" : "Install for faster access & offline support"}
          </div>
        </div>
        <Download className="h-4 w-4 shrink-0 text-primary opacity-60 group-hover:opacity-100" />
      </button>

      {isIOS && <IOSInstallSheet open={iosSheetOpen} onClose={() => setIosSheetOpen(false)} />}
    </>
  );
};

export default PWAInstallCard;
