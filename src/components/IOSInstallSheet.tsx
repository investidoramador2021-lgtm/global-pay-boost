import { X, Share, ChevronDown, PlusSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface IOSInstallSheetProps {
  open: boolean;
  onClose: () => void;
}

const IOSInstallSheet = ({ open, onClose }: IOSInstallSheetProps) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[101] rounded-t-3xl border-t border-border bg-background p-6 pb-10 safe-area-bottom"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Handle bar */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-6 text-center">
              <h3 className="font-display text-lg font-bold text-foreground">Install MRC GlobalPay</h3>
              <p className="mt-1 font-body text-sm text-muted-foreground">Add to your Home Screen for the best experience</p>
            </div>

            <div className="space-y-5">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-display text-sm font-bold text-primary">
                  1
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    Tap the Share button
                  </p>
                  <p className="mt-0.5 font-body text-xs text-muted-foreground">
                    Find the <Share className="inline h-3.5 w-3.5 align-text-bottom" /> icon in Safari's toolbar
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-display text-sm font-bold text-primary">
                  2
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    Scroll down in the menu
                  </p>
                  <p className="mt-0.5 font-body text-xs text-muted-foreground">
                    Swipe up <ChevronDown className="inline h-3.5 w-3.5 rotate-180 align-text-bottom" /> to find more options
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-display text-sm font-bold text-primary">
                  3
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    Tap "Add to Home Screen"
                  </p>
                  <p className="mt-0.5 font-body text-xs text-muted-foreground">
                    Look for the <PlusSquare className="inline h-3.5 w-3.5 align-text-bottom" /> icon and tap it
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Got it
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IOSInstallSheet;
