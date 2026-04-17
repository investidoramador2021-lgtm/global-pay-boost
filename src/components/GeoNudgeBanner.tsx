import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Globe } from "lucide-react";
import {
  getLangFromPath,
  langPath,
  stripLangPrefix,
  type SupportedLanguage,
} from "@/i18n";

const DISMISS_KEY = "geo-nudge-dismissed";

/** Country code → suggested hub language */
const COUNTRY_TO_LANG: Record<string, SupportedLanguage> = {
  TR: "tr",
  VN: "vi",
  BR: "pt",
  PT: "pt",
  FR: "fr",
  BE: "fr",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  JP: "ja",
  IR: "fa",
  PK: "ur",
  IL: "he",
  ZA: "af",
  IN: "hi",
  UA: "uk",
};

/** Localized invitation copy */
const COPY: Record<SupportedLanguage, { msg: string; cta: string; dismiss: string }> = {
  en: { msg: "View MRC GlobalPay in your local language for region-specific rates.", cta: "Switch", dismiss: "Dismiss" },
  tr: { msg: "Türkiye'den mi giriyorsunuz? Lira'dan altına saklamasız hub'ımıza göz atın.", cta: "Hub'a git", dismiss: "Kapat" },
  vi: { msg: "Bạn đang truy cập từ Việt Nam? Hãy ghé thăm Trung tâm SOL & AI chuyên biệt của chúng tôi.", cta: "Khám phá ngay", dismiss: "Đóng" },
  pt: { msg: "Veja a MRC GlobalPay em português com taxas para o Brasil.", cta: "Mudar", dismiss: "Fechar" },
  es: { msg: "Ver MRC GlobalPay en español con tasas locales.", cta: "Cambiar", dismiss: "Cerrar" },
  fr: { msg: "Affichez MRC GlobalPay en français avec des taux locaux.", cta: "Changer", dismiss: "Fermer" },
  ja: { msg: "MRC GlobalPayを日本語で表示します。", cta: "切替", dismiss: "閉じる" },
  fa: { msg: "MRC GlobalPay را به فارسی مشاهده کنید.", cta: "تغییر", dismiss: "بستن" },
  ur: { msg: "MRC GlobalPay اردو میں دیکھیں۔", cta: "تبدیل", dismiss: "بند" },
  he: { msg: "צפו ב-MRC GlobalPay בעברית.", cta: "החלף", dismiss: "סגור" },
  af: { msg: "Bekyk MRC GlobalPay in Afrikaans.", cta: "Wissel", dismiss: "Maak toe" },
  hi: { msg: "MRC GlobalPay को हिंदी में देखें।", cta: "बदलें", dismiss: "बंद" },
  uk: { msg: "Переглянути MRC GlobalPay українською.", cta: "Змінити", dismiss: "Закрити" },
};

/**
 * Non-intrusive geo-nudge banner.
 * If user IP country maps to a supported hub AND they're not already on it,
 * show a localized invitation. Dismiss persists in localStorage.
 */
const GeoNudgeBanner = () => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [suggested, setSuggested] = useState<SupportedLanguage | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const currentLang = getLangFromPath(pathname);
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { cache: "force-cache" });
        if (!res.ok) return;
        const data = await res.json();
        const country: string | undefined = data?.country_code;
        if (!country) return;

        const hubLang = COUNTRY_TO_LANG[country.toUpperCase()];
        if (!hubLang) return;

        // Deep hubs: VN → /vi/vietnam, TR → /tr/turkiye.
        // Show the nudge on ANY page that isn't already the deep hub.
        if (hubLang === "vi") {
          if (pathname === "/vi/vietnam" || pathname === "/vi/vietnam/") return;
        } else if (hubLang === "tr") {
          if (pathname === "/tr/turkiye" || pathname === "/tr/turkiye/") return;
        } else if (hubLang === currentLang) {
          return;
        }
        if (cancelled) return;

        setSuggested(hubLang);
        setShow(true);
      } catch {
        // silent fail — geo-nudge is purely additive
      }
    })();

    return () => { cancelled = true; };
  }, [pathname]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  const switchLang = () => {
    if (!suggested) return;
    const bare = stripLangPrefix(pathname);
    localStorage.setItem("user-lang", suggested);
    localStorage.setItem(DISMISS_KEY, "1");
    // Deep-hub destinations override generic langPath
    let target: string;
    if (suggested === "vi") target = "/vi/vietnam";
    else if (suggested === "tr") target = "/tr/turkiye";
    else target = langPath(suggested, bare) + search + hash;
    navigate(target);
    setShow(false);
  };

  if (!show || !suggested) return null;
  const copy = COPY[suggested];

  return (
    <div
      role="region"
      aria-label="Language suggestion"
      className="fixed inset-x-0 bottom-20 z-40 mx-auto flex max-w-md items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2.5 shadow-elevated backdrop-blur-xl lg:bottom-6"
    >
      <Globe className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p className="flex-1 text-xs text-foreground">{copy.msg}</p>
      <button
        onClick={switchLang}
        className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {copy.cta}
      </button>
      <button
        onClick={dismiss}
        className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label={copy.dismiss}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default GeoNudgeBanner;
