import { useNavigate, useLocation } from "react-router-dom";
import { Globe } from "lucide-react";
import {
  supportedLanguages,
  languageMeta,
  getLangFromPath,
  type SupportedLanguage,
} from "@/i18n";

const LANG_TO_COUNTRY: Record<string, string> = {
  en: "us", es: "es", pt: "br", fr: "fr", ja: "jp", fa: "ir",
  ur: "pk", he: "il", af: "za", hi: "in", vi: "vn", tr: "tr", uk: "ua",
};

function flagUrl(lang: string): string {
  const code = LANG_TO_COUNTRY[lang] || lang;
  return `https://flagcdn.com/w40/${code}.png`;
}

interface BlogLanguageToggleProps {
  /** Set of lang codes this post has translations for (must include "en") */
  availableLanguages: Set<string>;
  /** The English source post's slug — used as the URL for `en`. */
  englishSlug: string;
  /** Map of { lang -> localized slug } for non-English translations. */
  translatedSlugs: Record<string, string>;
}

/**
 * Renders one button per available language. Each button navigates to the
 * canonical URL for that language: `/blog/<en-slug>` for English, or
 * `/${lang}/blog/<localized-slug>` for translations. This avoids generating
 * cross-language URL combinations (e.g. /fr/blog/<en-slug>) that would
 * 404-redirect and pollute GSC with "Page with redirect" entries.
 */
const BlogLanguageToggle = ({
  availableLanguages,
  englishSlug,
  translatedSlugs,
}: BlogLanguageToggleProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentLang = getLangFromPath(pathname);

  const langs = supportedLanguages.filter((l) => availableLanguages.has(l));

  if (langs.length < 2) return null;

  const switchLang = (lang: SupportedLanguage) => {
    if (lang === currentLang) return;
    const newPath =
      lang === "en"
        ? `/blog/${englishSlug}`
        : `/${lang}/blog/${translatedSlugs[lang] ?? englishSlug}`;
    navigate(newPath);
  };

  return (
    <div className="mb-6 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
      <p className="mb-2.5 flex items-center gap-2 font-display text-xs font-semibold text-muted-foreground">
        <Globe className="h-3.5 w-3.5" />
        Read in your language
      </p>
      <div className="flex flex-wrap gap-1.5">
        {langs.map((lang) => {
          const isActive = lang === currentLang;
          const meta = languageMeta[lang];
          return (
            <button
              key={lang}
              onClick={() => switchLang(lang)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <img
                src={flagUrl(lang)}
                alt=""
                className="h-3.5 w-3.5 rounded-full object-cover"
              />
              <span className="hidden sm:inline">{meta.native}</span>
              <span className="sm:hidden">{lang.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BlogLanguageToggle;
