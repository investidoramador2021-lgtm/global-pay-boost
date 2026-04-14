import { ArrowLeftRight, Landmark, TrendingUp, Clock, HelpCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const navItems = [
  { label: "Swap", icon: ArrowLeftRight, href: "/#exchange" },
  { label: "Borrow", icon: Landmark, href: "/lend" },
  { label: "Earn", icon: TrendingUp, href: "/lend?tab=earn" },
  { label: "Track", icon: Clock, href: "/lend?tab=track" },
  { label: "Help", icon: HelpCircle, href: "/#faq" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const currentHash = location.hash;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden safe-area-bottom">
      <div className="flex h-16 items-stretch">
        {navItems.map((item) => {
          const isActive = currentHash === item.href.replace("/", "") || (!currentHash && item.label === "Swap");
          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors touch-target ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span className="font-display text-[10px] font-bold uppercase tracking-wide">
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
