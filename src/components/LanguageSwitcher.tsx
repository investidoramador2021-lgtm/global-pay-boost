import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, Search, Check } from "lucide-react";
import {
  supportedLanguages,
  languageMeta,
  getLangFromPath,
  stripLangPrefix,
  langPath,
  type SupportedLanguage,
} from "@/i18n";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const currentLang = getLangFromPath(pathname);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const switchLang = (lang: SupportedLanguage) => {
    if (lang === currentLang) {
      setOpen(false);
      return;
    }
    const bare = stripLangPrefix(pathname);
    const newPath = langPath(lang, bare) + search + hash;
    localStorage.setItem("user-lang", lang);
    i18n.changeLanguage(lang);
    navigate(newPath);
    setOpen(false);
    setQuery("");
  };

  const filtered = supportedLanguages.filter((lang) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const meta = languageMeta[lang];
    return (
      lang.includes(q) ||
      meta.english.toLowerCase().includes(q) ||
      meta.native.toLowerCase().includes(q)
    );
  });

  const currentMeta = languageMeta[currentLang];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Switch language"
        title="Switch language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden text-xs font-medium sm:inline">{currentMeta.native}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
          {/* Search input */}
          <div className="border-b border-border p-2">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search language…"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Language list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                No languages found
              </p>
            )}
            {filtered.map((lang) => {
              const meta = languageMeta[lang];
              const isActive = lang === currentLang;
              return (
                <button
                  key={lang}
                  onClick={() => switchLang(lang)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/60 ${
                    isActive ? "bg-primary/5" : ""
                  }`}
                >
                  <span className="min-w-[28px] text-xs font-mono uppercase text-muted-foreground">
                    {lang}
                  </span>
                  <span className="flex-1">
                    <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                      {meta.native}
                    </span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {meta.english}
                    </span>
                  </span>
                  {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
