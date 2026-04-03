import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  supportedLanguages,
  languageLabels,
  getLangFromPath,
  stripLangPrefix,
  langPath,
  type SupportedLanguage,
} from "@/i18n";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  const currentLang = getLangFromPath(pathname);

  const switchLang = (lang: SupportedLanguage) => {
    if (lang === currentLang) return;
    const bare = stripLangPrefix(pathname);
    const newPath = langPath(lang, bare) + search + hash;
    i18n.changeLanguage(lang);
    navigate(newPath);
  };

  return (
    <div className="relative group">
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Switch language"
        title="Switch language"
      >
        <Globe className="h-4 w-4" />
      </button>
      <div className="absolute right-0 top-full mt-1 hidden min-w-[120px] rounded-lg border border-border bg-card shadow-elevated group-hover:block z-50">
        {supportedLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => switchLang(lang)}
            className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent first:rounded-t-lg last:rounded-b-lg ${
              lang === currentLang
                ? "font-semibold text-primary"
                : "text-muted-foreground"
            }`}
          >
            {languageLabels[lang]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
