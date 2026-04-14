import { ArrowLeftRight, Landmark, TrendingUp, Clock, HelpCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MobileBottomNav = () => {
  const location = useLocation();
  const currentHash = location.hash;
  const { t } = useTranslation();

  const navItems = [
    { labelKey: "widget.tabs.exchange", icon: ArrowLeftRight, href: "/#exchange" },
    { labelKey: "widget.tabs.loan", icon: Landmark, href: "/lend" },
    { labelKey: "widget.tabs.earn", icon: TrendingUp, href: "/lend?tab=earn" },
    { labelKey: "nav.track", icon: Clock, href: "/lend?tab=track" },
    { labelKey: "nav.help", icon: HelpCircle, href: "/#faq" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden safe-area-bottom">
      <div className="flex h-16 items-stretch">
        {navItems.map((item) => {
          const isActive = currentHash === item.href.replace("/", "") || (!currentHash && item.labelKey === "widget.tabs.exchange");
          return (
            <a
              key={item.labelKey}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors touch-target ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span className="font-display text-[10px] font-bold uppercase tracking-wide">
                {t(item.labelKey)}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
