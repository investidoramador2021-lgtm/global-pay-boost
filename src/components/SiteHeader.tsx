import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getLangFromPath, langPath } from "@/i18n";

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lp = (path: string) => langPath(lang, path);

  const navLinks = [
    { label: t("nav.howItWorks"), href: lp("/") + "#how-it-works" },
    { label: t("nav.features"), href: lp("/") + "#features" },
    { label: t("nav.swapPairs"), href: lp("/") + "#swap-pairs" },
    { label: t("nav.blog"), href: lp("/blog") },
    { label: t("nav.faq"), href: lp("/") + "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
        <Link to={lp("/")} className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
          MRC<span className="text-primary">GlobalPay</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
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

          <div className="hidden lg:block">
            <Button className="shadow-neon" size="sm" asChild>
              <Link to={lp("/") + "#exchange"}>
                <Zap className="me-1 h-4 w-4" />
                {t("nav.startSwap")}
              </Link>
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
            <Link
              key={link.href}
              to={link.href}
              className="block py-3 font-body text-sm font-medium text-muted-foreground active:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Button className="mt-2 w-full shadow-neon" size="sm" asChild>
            <Link to={lp("/") + "#exchange"} onClick={() => setMobileOpen(false)}>
              <Zap className="me-1 h-4 w-4" />
              {t("nav.startSwap")}
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
