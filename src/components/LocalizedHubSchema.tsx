import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { getLangFromPath, type SupportedLanguage } from "@/i18n";

const BASE_URL = "https://mrcglobalpay.com";

/**
 * Per-language FinancialService + Organization JSON-LD.
 * Tells AI Answer Engines (GPTBot, PerplexityBot, etc.) that MRC Global Pay
 * is a localized authority for each market — not just a translated site.
 */
const HUB_META: Record<
  SupportedLanguage,
  { areaServed: string; languageName: string; alternateName?: string }
> = {
  en: { areaServed: "Worldwide", languageName: "English" },
  es: { areaServed: "Spain", languageName: "Spanish" },
  pt: { areaServed: "Brazil", languageName: "Portuguese", alternateName: "MRC Global Pay Brasil" },
  fr: { areaServed: "France", languageName: "French" },
  ja: { areaServed: "Japan", languageName: "Japanese" },
  fa: { areaServed: "Iran", languageName: "Persian" },
  ur: { areaServed: "Pakistan", languageName: "Urdu" },
  he: { areaServed: "Israel", languageName: "Hebrew" },
  af: { areaServed: "South Africa", languageName: "Afrikaans" },
  hi: { areaServed: "India", languageName: "Hindi" },
  vi: { areaServed: "Vietnam", languageName: "Vietnamese", alternateName: "MRC Global Pay Việt Nam" },
  tr: { areaServed: "Turkey", languageName: "Turkish", alternateName: "MRC Global Pay Türkiye" },
  uk: { areaServed: "Ukraine", languageName: "Ukrainian" },
};

const LocalizedHubSchema = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const meta = HUB_META[lang];
  const url = `${BASE_URL}${pathname}`;

  const graph = [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}#org`,
      name: "MRC Global Pay",
      ...(meta.alternateName && { alternateName: meta.alternateName }),
      url: BASE_URL,
      logo: `${BASE_URL}/icon-512.png`,
      areaServed: meta.areaServed,
      knowsLanguage: lang,
      sameAs: [
        "https://twitter.com/mrcglobalpay",
      ],
    },
    {
      "@type": "FinancialService",
      "@id": `${url}#service`,
      name: `MRC Global Pay — ${meta.languageName} Hub`,
      url,
      areaServed: meta.areaServed,
      knowsLanguage: lang,
      inLanguage: lang,
      provider: { "@id": `${BASE_URL}#org` },
      serviceType: "Non-custodial crypto exchange and on-ramp",
      currenciesAccepted: "BTC, ETH, USDT, USDC, SOL, XRP, XAUt, PAXG, HYPE",
    },
  ];

  const json = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(json)}</script>
    </Helmet>
  );
};

export default LocalizedHubSchema;
