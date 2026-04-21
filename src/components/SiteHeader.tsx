import { useState, useEffect } from "react";
import { Menu, X, Zap, Sun, Moon, UserPlus, LogIn, ChevronDown, Sparkles, Users, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import GetTheAppBadges from "@/components/GetTheAppBadges";
import TopTrustStrip from "@/components/TopTrustStrip";

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

  // Primary nav: always visible on lg+ (kept short to fit longest translations)
  const primaryNavLinks = [
    { label: t("nav.howItWorks"), href: lp("/") + "#how-it-works" },
    { label: t("nav.exchange"), href: lp("/exchange/btc-to-eth") },
    { label: t("nav.borrow"), href: lp("/lend") },
    { label: t("nav.earn"), href: lp("/lend") + "?tab=earn" },
  ];

  // Secondary nav: shown inline at xl+, collapsed into "More" dropdown on lg
  const secondaryNavLinks = [
    { label: t("nav.blog"), href: lp("/blog") },
    { label: t("nav.faq"), href: lp("/") + "#faq" },
    { label: t("nav.developer"), href: lp("/developer") },
  ];

  // Mobile-only extras (kept out of desktop bar to avoid crowding)
  const mobileExtraLinks = [
    { label: t("nav.features"), href: lp("/") + "#features" },
  ];

  const programLinks = [
    { label: t("programsNav.affiliates"), href: lp("/affiliates"), icon: Sparkles, desc: t("programsNav.affiliatesDesc") },
    { label: t("programsNav.partners"), href: lp("/partners"), icon: Users, desc: t("programsNav.partnersDesc") },
    { label: t("programsNav.referral"), href: lp("/referral"), icon: Share2, desc: t("programsNav.referralDesc") },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border transition-[backdrop-filter,background-color] duration-300 ${
        scrolled
          ? "bg-background/60 backdrop-blur-xl shadow-sm"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      }`}
    >
      <TopTrustStrip />
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
        <a href={lp("/")} className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
          MRC<span className="text-primary">GlobalPay</span>
        </a>

        <nav className="hidden items-center gap-3 xl:gap-5 lg:flex">
          {/* Primary links — always visible on lg+ */}
          {primaryNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap font-body text-[13px] xl:text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}

          {/* Secondary links — inline only at xl+ to prevent crowding in long-label languages */}
          <div className="hidden xl:flex xl:items-center xl:gap-5">
            {secondaryNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* "More" dropdown — visible only on lg (hidden at xl since secondary links go inline) */}
          <div className="relative group xl:hidden">
            <button
              type="button"
              className="inline-flex items-center gap-1 whitespace-nowrap font-body text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-haspopup="menu"
              aria-label={t("nav.more")}
            >
              {t("nav.more")}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
            </button>
            <div
              role="menu"
              className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150 z-50"
            >
              <div className="rounded-2xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-xl p-1.5">
                {secondaryNavLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className="block rounded-xl px-3 py-2.5 font-body text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Programs dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center gap-1 whitespace-nowrap font-body text-[13px] xl:text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-haspopup="menu"
              aria-label={t("programsNav.menu")}
            >
              {t("programsNav.menu")}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
            </button>
            <div
              role="menu"
              className="absolute right-0 top-full pt-2 w-72 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150 z-50"
            >
              <div className="rounded-2xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-xl p-1.5">
                {programLinks.map((p) => {
                  const Icon = p.icon;
                  return (
                    <a
                      key={p.href}
                      href={p.href}
                      role="menuitem"
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-body text-sm font-semibold text-foreground">{p.label}</span>
                        <span className="block text-xs text-muted-foreground truncate">{p.desc}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
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
          {[...primaryNavLinks, ...secondaryNavLinks, ...mobileExtraLinks].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-3 font-body text-sm font-medium text-muted-foreground active:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}

          {/* Programs section (mobile) */}
          <div className="mt-1 border-t border-border/50 pt-2">
            <div className="px-1 py-2 text-xs font-semibold uppercase tracking-wider text-primary">
              {t("programsNav.menu")}
            </div>
            {programLinks.map((p) => {
              const Icon = p.icon;
              return (
                <a
                  key={p.href}
                  href={p.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-muted-foreground active:bg-accent active:text-foreground"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {p.label}
                </a>
              );
            })}
          </div>

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
