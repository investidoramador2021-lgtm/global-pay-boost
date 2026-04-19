import { ArrowLeftRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLangFromPath, langPath } from "@/i18n";

const FloatingSwapButton = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const lang = getLangFromPath(pathname);
  const homeHref = langPath(lang, "/") + "#exchange";

  // Hide on embed widget routes to keep iframe clean
  if (pathname.startsWith("/embed/") || pathname.includes("/embed/")) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const homePath = langPath(lang, "/");
    // If already on home page, just scroll to widget smoothly
    if (pathname === homePath || pathname === homePath.replace(/\/$/, "")) {
      e.preventDefault();
      const el = document.getElementById("exchange");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.hash = "#exchange";
      }
    }
  };

  const label = t("nav.startSwap", { defaultValue: "Swap Now" });

  return (
    <a
      href={homeHref}
      onClick={handleClick}
      aria-label={label}
      className="group fixed bottom-20 left-4 z-[60] inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 font-body text-sm font-semibold text-primary-foreground shadow-neon ring-1 ring-primary/40 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 active:scale-95 sm:bottom-6 sm:left-6 sm:px-5 sm:py-3.5 lg:bottom-8 lg:left-8"
    >
      <ArrowLeftRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" aria-hidden="true" />
      <span className="hidden xs:inline sm:inline">{label}</span>
      <span className="inline xs:hidden sm:hidden">Swap</span>
    </a>
  );
};

export default FloatingSwapButton;
