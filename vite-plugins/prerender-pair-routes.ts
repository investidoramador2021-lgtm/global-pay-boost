/**
 * Vite plugin: prerender-pair-routes
 *
 * Prerenders the top ~2,000 highest-traffic /exchange/[from]-to-[to] pages
 * across all 13 languages = ~26,000 static HTML files.
 *
 * Each file ships:
 *   - per-pair <title>, <meta description>, canonical, hreflang
 *   - per-pair Open Graph + Twitter tags
 *   - per-pair JSON-LD (FinancialProduct + BreadcrumbList)
 *   - localized <noscript> body with H1, intro, and a "Swap now" CTA
 *
 * The pair list lives in `top-pairs.json` (committed) and was generated
 * once from the production database. To refresh it, run the dump script
 * (see git history or scripts-dump-pairs.mjs).
 *
 * Pairs NOT in the top-2,000 keep using client-side React Helmet (SPA
 * fallback serves index.html which now has rich JSON-LD/FAQ for any URL).
 */
import type { Plugin } from "vite";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import topPairs from "./top-pairs.json";

const SITE = "https://mrcglobalpay.com";
const LANGS = ["en", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"] as const;
type Lang = (typeof LANGS)[number];

const OG_LOCALE: Record<Lang, string> = {
  en: "en_US", es: "es_ES", pt: "pt_BR", fr: "fr_FR", ja: "ja_JP",
  fa: "fa_IR", ur: "ur_PK", he: "he_IL", af: "af_ZA", hi: "hi_IN",
  vi: "vi_VN", tr: "tr_TR", uk: "uk_UA",
};

// Localized "Swap X to Y" template + intro + CTA
const I18N: Record<Lang, { titlePrefix: (f: string, t: string) => string; intro: (f: string, t: string) => string; cta: string }> = {
  en: { titlePrefix: (f, t) => `Swap ${f} to ${t}`, intro: (f, t) => `Instantly swap ${f} to ${t} at the best aggregated rate from 700+ liquidity venues. No registration, no KYC, $0.30 minimum, settles directly to your wallet.`, cta: "Open the live swap interface" },
  es: { titlePrefix: (f, t) => `Intercambia ${f} a ${t}`, intro: (f, t) => `Intercambia ${f} a ${t} al instante con la mejor tasa agregada de más de 700 mercados de liquidez. Sin registro, sin KYC, mínimo $0.30, se liquida directamente a tu billetera.`, cta: "Abrir el intercambio en vivo" },
  pt: { titlePrefix: (f, t) => `Troque ${f} por ${t}`, intro: (f, t) => `Troque ${f} por ${t} instantaneamente com a melhor taxa agregada de mais de 700 fontes de liquidez. Sem registro, sem KYC, mínimo $0.30, liquidação direta para sua carteira.`, cta: "Abrir a interface de troca ao vivo" },
  fr: { titlePrefix: (f, t) => `Échangez ${f} contre ${t}`, intro: (f, t) => `Échangez ${f} contre ${t} instantanément au meilleur taux agrégé de plus de 700 sources de liquidité. Sans inscription, sans KYC, minimum 0,30 $, règlement direct vers votre wallet.`, cta: "Ouvrir l'interface d'échange en direct" },
  ja: { titlePrefix: (f, t) => `${f} を ${t} にスワップ`, intro: (f, t) => `${f} を ${t} に、700以上の流動性ソースから集約された最適レートで即時スワップ。登録不要、KYC不要、最低 $0.30、ウォレットへ直接決済。`, cta: "ライブスワップ画面を開く" },
  fa: { titlePrefix: (f, t) => `تبدیل ${f} به ${t}`, intro: (f, t) => `${f} را در لحظه به ${t} با بهترین نرخ تجمیعی از بیش از ۷۰۰ منبع نقدینگی تبدیل کنید. بدون ثبت‌نام، بدون KYC، حداقل ۰٫۳۰ دلار، تسویه مستقیم به کیف پول شما.`, cta: "باز کردن صفحه تبادل زنده" },
  ur: { titlePrefix: (f, t) => `${f} کو ${t} میں سویپ کریں`, intro: (f, t) => `700+ لیکویڈیٹی ذرائع سے بہترین مجموعی شرح پر ${f} کو ${t} میں فوری سویپ کریں۔ کوئی رجسٹریشن نہیں، KYC نہیں، کم از کم $0.30، براہ راست آپ کے والیٹ میں سیٹل۔`, cta: "لائیو سویپ انٹرفیس کھولیں" },
  he: { titlePrefix: (f, t) => `החלפת ${f} ל-${t}`, intro: (f, t) => `החלף ${f} ל-${t} מיידית בשער המצרפי הטוב ביותר מ-700+ מקורות נזילות. ללא הרשמה, ללא KYC, מינימום $0.30, תשלום ישיר לארנק שלך.`, cta: "פתח את ממשק ההחלפה החי" },
  af: { titlePrefix: (f, t) => `Ruil ${f} vir ${t}`, intro: (f, t) => `Ruil ${f} onmiddellik vir ${t} teen die beste saamgevoegde tarief vanaf 700+ likiditeitsbronne. Geen registrasie, geen KYC, minimum $0.30, vereffen direk in jou beursie.`, cta: "Maak die regstreekse ruilskerm oop" },
  hi: { titlePrefix: (f, t) => `${f} को ${t} में स्वैप करें`, intro: (f, t) => `${f} को ${t} में 700+ लिक्विडिटी स्रोतों से सर्वोत्तम समग्र दर पर तुरंत स्वैप करें। कोई पंजीकरण नहीं, KYC नहीं, न्यूनतम $0.30, सीधे आपके वॉलेट में सेटल।`, cta: "लाइव स्वैप इंटरफ़ेस खोलें" },
  vi: { titlePrefix: (f, t) => `Hoán đổi ${f} sang ${t}`, intro: (f, t) => `Hoán đổi ${f} sang ${t} ngay lập tức với tỷ giá tổng hợp tốt nhất từ hơn 700 nguồn thanh khoản. Không đăng ký, không KYC, tối thiểu $0.30, thanh toán trực tiếp đến ví của bạn.`, cta: "Mở giao diện hoán đổi trực tiếp" },
  tr: { titlePrefix: (f, t) => `${f} → ${t} takas`, intro: (f, t) => `${f} kripto parasını 700+ likidite kaynağından alınan en iyi toplu kurla anında ${t} ile takas edin. Kayıt yok, KYC yok, minimum 0,30 $, doğrudan cüzdanınıza ödenir.`, cta: "Canlı takas arayüzünü aç" },
  uk: { titlePrefix: (f, t) => `Обмін ${f} на ${t}`, intro: (f, t) => `Миттєво обміняйте ${f} на ${t} за найкращим зведеним курсом з 700+ джерел ліквідності. Без реєстрації, без KYC, мінімум $0.30, зарахування прямо на ваш гаманець.`, cta: "Відкрити живий інтерфейс обміну" },
};

interface PairRow {
  from_ticker: string;
  to_ticker: string;
  seo_title: string;
  seo_description: string;
  seo_h1: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHead(opts: {
  lang: Lang;
  pair: PairRow;
  routePath: string;
  canonical: string;
}): string {
  const { lang, pair, routePath, canonical } = opts;
  const FROM = pair.from_ticker.toUpperCase();
  const TO = pair.to_ticker.toUpperCase();
  const i18n = I18N[lang];
  const title = lang === "en"
    ? `${pair.seo_title}`
    : `${i18n.titlePrefix(FROM, TO)} | MRC GlobalPay`;
  const description = lang === "en" ? pair.seo_description : i18n.intro(FROM, TO);
  const ogImage = `${SITE}/og-image.jpg`;

  const hreflangLinks = LANGS.map((l) => {
    const prefix = l === "en" ? "" : `/${l}`;
    return `    <link rel="alternate" hreflang="${l}" href="${SITE}${prefix}${routePath}" />`;
  }).join("\n");

  const altLocales = LANGS.filter((l) => l !== lang)
    .map((l) => `    <meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`)
    .join("\n");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FinancialProduct",
        name: `${FROM} to ${TO} Swap`,
        description,
        provider: { "@type": "Organization", name: "MRC GlobalPay", url: SITE },
        feesAndCommissionsSpecification: "0.4% routing fee, no hidden spreads",
        category: "Cryptocurrency Exchange",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Exchange", item: `${SITE}/exchange` },
          { "@type": "ListItem", position: 3, name: `${FROM} to ${TO}`, item: canonical },
        ],
      },
    ],
  };

  return `    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
${hreflangLinks}
    <link rel="alternate" hreflang="x-default" href="${SITE}${routePath}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:site_name" content="MRC GlobalPay" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:locale" content="${OG_LOCALE[lang]}" />
${altLocales}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

function buildNoscript(opts: { lang: Lang; pair: PairRow; canonical: string }): string {
  const { lang, pair, canonical } = opts;
  const FROM = pair.from_ticker.toUpperCase();
  const TO = pair.to_ticker.toUpperCase();
  const i18n = I18N[lang];
  const h1 = lang === "en" ? pair.seo_h1 : i18n.titlePrefix(FROM, TO);
  const intro = lang === "en" ? pair.seo_description : i18n.intro(FROM, TO);
  const dir = ["fa", "ur", "he"].includes(lang) ? 'dir="rtl"' : "";
  return `    <noscript>
      <div ${dir} style="max-width:1100px;margin:0 auto;padding:32px 20px;font-family:system-ui,sans-serif;color:#0f172a;background:#fff;line-height:1.7">
        <h1 style="font-size:32px;margin:0 0 12px">${escapeHtml(h1)}</h1>
        <p style="font-size:18px;color:#334155">${escapeHtml(intro)}</p>
        <p style="margin-top:16px"><strong>${escapeHtml(FROM)} → ${escapeHtml(TO)}</strong> · 700+ liquidity venues · 0.4% fee · $0.30 minimum · No KYC · MSB C100000015</p>
        <p style="margin-top:24px"><a href="${escapeHtml(canonical)}" style="color:#0ea5e9;font-weight:600">${escapeHtml(i18n.cta)} →</a></p>
        <nav style="margin-top:32px;font-size:14px;color:#64748b">
          <a href="/">Home</a> · <a href="/exchange/btc-to-usdt">BTC→USDT</a> · <a href="/exchange/eth-to-btc">ETH→BTC</a> · <a href="/exchange/sol-to-usdt">SOL→USDT</a> · <a href="/exchange/xrp-to-usdt">XRP→USDT</a> · <a href="/exchange/doge-to-btc">DOGE→BTC</a>
        </nav>
      </div>
    </noscript>`;
}

export function prerenderPairRoutes(outDir = "dist"): Plugin {
  return {
    name: "prerender-pair-routes",
    apply: "build",
    closeBundle() {
      const log = (m: string) => console.log(`[prerender-pairs] ${m}`);
      const shellPath = join(outDir, "index.html");
      if (!existsSync(shellPath)) {
        log(`✗ ${shellPath} not found, skipping`);
        return;
      }
      const shell = readFileSync(shellPath, "utf8");
      const pairs = topPairs as PairRow[];
      log(`Prerendering ${pairs.length} pairs × ${LANGS.length} languages = ${pairs.length * LANGS.length} files...`);
      let written = 0;

      for (const pair of pairs) {
        const slug = `${pair.from_ticker}-to-${pair.to_ticker}`;
        const routePath = `/exchange/${slug}`;
        const canonical = `${SITE}${routePath}`;
        for (const lang of LANGS) {
          const langPrefix = lang === "en" ? "" : `/${lang}`;
          const fullPath = `${langPrefix}${routePath}`;
          const targetPath = join(outDir, fullPath.replace(/^\//, ""), "index.html");

          const head = buildHead({ lang, pair, routePath, canonical });
          const noscript = buildNoscript({ lang, pair, canonical });

          let html = shell.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"`);
          html = html.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
          html = html.replace(/<meta\s+name="description"[^>]*>\s*/gi, "");
          html = html.replace(/<meta\s+name="robots"[^>]*>\s*/gi, "");
          html = html.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "");
          html = html.replace(/<link\s+rel="alternate"\s+hreflang[^>]*>\s*/gi, "");
          html = html.replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, "");
          html = html.replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, "");
          // Strip the homepage's static FAQ noscript so the pair page has its own
          html = html.replace(/<noscript>[\s\S]*?<\/noscript>\s*/i, "");
          html = html.replace(/<\/head>/i, `${head}\n  </head>`);
          html = html.replace(/<body([^>]*)>/i, `<body$1>\n${noscript}`);

          mkdirSync(dirname(targetPath), { recursive: true });
          writeFileSync(targetPath, html, "utf8");
          written++;
        }
      }
      log(`✓ Wrote ${written} prerendered pair HTML files.`);
    },
  };
}
