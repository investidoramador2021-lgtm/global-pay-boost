import { Link, useLocation } from "react-router-dom";
import { Share2, Users, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGS = ["en", "es", "fr", "pt", "tr", "uk", "vi", "hi", "ja", "fa", "ur", "he", "af"];

const useLp = () => {
  const { pathname } = useLocation();
  const seg = pathname.split("/")[1];
  const prefix = LANGS.includes(seg) ? `/${seg}` : "";
  return (p: string) => `${prefix}${p}`;
};

type Active = "affiliates" | "partners" | "referral";

const items: { key: Active; label: string; path: string; icon: typeof Share2 }[] = [
  { key: "affiliates", label: "Affiliates", path: "/affiliates", icon: Share2 },
  { key: "partners", label: "Partners", path: "/partners", icon: Users },
  { key: "referral", label: "Referral", path: "/referral", icon: Gift },
];

export const ProgramsNav = ({ active }: { active: Active }) => {
  const lp = useLp();
  return (
    <div className="border-b border-border/60 bg-muted/30">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-2 px-4 py-3">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Our Programs:
        </span>
        {items.map((it, i) => {
          const isActive = it.key === active;
          const Icon = it.icon;
          return (
            <div key={it.key} className="flex items-center gap-2">
              {i > 0 && <span className="text-muted-foreground/50">|</span>}
              {isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Icon className="h-3 w-3" /> {it.label}
                </span>
              ) : (
                <Link
                  to={lp(it.path)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition",
                    "hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  <Icon className="h-3 w-3" /> {it.label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ProgramsFooterLinks = ({ active }: { active: Active }) => {
  const lp = useLp();
  const others = items.filter((it) => it.key !== active);
  return (
    <section className="border-t border-border/60 bg-muted/20 py-10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Explore our programs
          </p>
          <h2 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">
            Three ways to earn lifetime BTC with MRC GlobalPay
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {items.map((it) => {
              const Icon = it.icon;
              const isActive = it.key === active;
              const desc =
                it.key === "affiliates"
                  ? "Embed our swap widget. Marketing assets + dashboard."
                  : it.key === "partners"
                    ? "Private dashboard, settlement reporting, negotiated rates."
                    : "One simple link. No setup. Best for casual sharers.";
              return (
                <Link
                  key={it.key}
                  to={lp(it.path)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-xl border p-4 text-left transition",
                    isActive
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-display text-sm font-semibold text-foreground">
                      {it.label} Program
                    </span>
                    {isActive && (
                      <span className="ml-auto text-[10px] font-semibold uppercase text-primary">
                        You are here
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
                </Link>
              );
            })}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            All programs pay in BTC and operate under FINTRAC MSB <strong>#C100000015</strong> and Bank of Canada PSP registration.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProgramsNav;
