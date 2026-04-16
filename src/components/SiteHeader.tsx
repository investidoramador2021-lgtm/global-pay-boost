import { useState, useEffect } from "react";
import { Menu, X, Zap, Sun, Moon, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import GetTheAppBadges from "@/components/GetTheAppBadges";

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lp = (path: string) => langPath(lang, path);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const navLinks = [
    { label: t("nav.howItWorks"), href: lp("/") + "#how-it-works" },
    { label: t("nav.features"), href: lp("/") + "#features" },
    { label: "Exchange", href: lp("/exchange/btc-to-eth") },
    { label: "Borrow", href: lp("/lend") },
    { label: "Earn", href: lp("/lend") + "?tab=earn" },
    { label: t("nav.blog"), href: lp("/blog") },
    { label: t("nav.faq"), href: lp("/") + "#faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border transition-[backdrop-filter,background-color] duration-300 ${
        scrolled
          ? "bg-background/60 backdrop-blur-xl shadow-sm"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      }`}
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
        <a href={lp("/")} className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
          MRC<span className="text-primary">GlobalPay</span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="hidden lg:flex items-center gap-1.5">
            <a
              href={lp("/partners") + "?mode=login"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Partner Login"
              title="Partner Login"
            >
              <LogIn className="h-4 w-4" />
            </a>
            <a
              href={lp("/partners")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Join Partner Program"
              title="Join Partner Program"
            >
              <UserPlus className="h-4 w-4" />
            </a>
            <Button className="shadow-neon" size="sm" asChild>
              <a href={lp("/") + "#exchange"}>
                <Zap className="me-1 h-4 w-4" />
                {t("nav.startSwap")}
              </a>
            </Button>
          </div>

          <button
            className="lg:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 lg:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-3 font-body text-sm font-medium text-muted-foreground active:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}

          {/* Partner actions */}
          <div className="flex items-center gap-2 py-3 border-t border-border/50 mt-1">
            <a
              href={lp("/partners") + "?mode=login"}
              onClick={() => setMobileOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-card/50 text-sm font-medium text-muted-foreground transition-colors active:bg-accent active:text-foreground"
            >
              <LogIn className="h-4 w-4" /> Partner Login
            </a>
            <a
              href={lp("/partners")}
              onClick={() => setMobileOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-primary/30 bg-primary/5 text-sm font-medium text-primary transition-colors active:bg-primary/10"
            >
              <UserPlus className="h-4 w-4" /> Join Program
            </a>
          </div>

          <div className="py-2">
            <GetTheAppBadges variant="inline" />
          </div>
          <Button className="mt-2 w-full shadow-neon" size="sm" asChild>
            <a href={lp("/") + "#exchange"} onClick={() => setMobileOpen(false)}>
              <Zap className="me-1 h-4 w-4" />
              {t("nav.startSwap")}
            </a>
          </Button>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
