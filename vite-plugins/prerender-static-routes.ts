/**
 * Vite plugin: prerender-static-routes
 *
 * After Vite finishes building, copy `dist/index.html` into one HTML file per
 * (route × language) for the high-value static pages and inject per-page SEO
 * (title, meta description, canonical, hreflang, Open Graph, JSON-LD) plus a
 * server-rendered <noscript> body so crawlers without JS still see real
 * content. React then hydrates over the same DOM client-side.
 *
 * NOTE: Pair pages (/exchange/*) are NOT handled here — there are ~289k of
 * them, way too many to prerender. They continue to be served by the SPA
 * shell with React Helmet writing meta tags after hydration. The seo-shell
 * Supabase function remains available as a backstop for bot rendering.
 *
 * Output: ~130 small .html files (~10 routes × 13 languages).
 */
import type { Plugin } from "vite";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { STATIC_ROUTE_SEO, type StaticRouteKey } from "./static-route-seo";

const SITE = "https://mrcglobalpay.com";
const LANGS = ["en", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"] as const;
type Lang = (typeof LANGS)[number];

const OG_LOCALE: Record<Lang, string> = {
  en: "en_US", es: "es_ES", pt: "pt_BR", fr: "fr_FR", ja: "ja_JP",
  fa: "fa_IR", ur: "ur_PK", he: "he_IL", af: "af_ZA", hi: "hi_IN",
  vi: "vi_VN", tr: "tr_TR", uk: "uk_UA",
};

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
  title: string;
  description: string;
  canonical: string;
  routePath: string;
  jsonLd?: Record<string, unknown>;
}): string {
  const { lang, title, description, canonical, routePath, jsonLd } = opts;
  const ogImage = `${SITE}/og-image.jpg`;

  const hreflangLinks = LANGS.map((l) => {
    const prefix = l === "en" ? "" : `/${l}`;
    return `    <link rel="alternate" hreflang="${l}" href="${SITE}${prefix}${routePath === "/" ? "" : routePath}" />`;
  }).join("\n");

  const altLocales = LANGS.filter((l) => l !== lang)
    .map((l) => `    <meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`)
    .join("\n");

  const ld = jsonLd
    ? `    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    : "";

  return `    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
${hreflangLinks}
    <link rel="alternate" hreflang="x-default" href="${SITE}${routePath === "/" ? "" : routePath}" />
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
${ld}`;
}

const NOSCRIPT_NAV_LABEL: Record<Lang, string> = {
  en: "More: ", es: "Más: ", pt: "Mais: ", fr: "Plus : ", ja: "詳細: ",
  fa: "بیشتر: ", ur: "مزید: ", he: "עוד: ", af: "Meer: ", hi: "अधिक: ",
  vi: "Thêm: ", tr: "Daha fazla: ", uk: "Більше: ",
};
const NOSCRIPT_OPEN_LABEL: Record<Lang, string> = {
  en: "Open the full interactive page",
  es: "Abrir la página interactiva completa",
  pt: "Abrir a página interativa completa",
  fr: "Ouvrir la page interactive complète",
  ja: "インタラクティブな完全ページを開く",
  fa: "باز کردن صفحه تعاملی کامل",
  ur: "مکمل انٹرایکٹو صفحہ کھولیں",
  he: "פתח את העמוד האינטראקטיבי המלא",
  af: "Open die volledige interaktiewe bladsy",
  hi: "पूर्ण इंटरैक्टिव पेज खोलें",
  vi: "Mở trang tương tác đầy đủ",
  tr: "Tam interaktif sayfayı aç",
  uk: "Відкрити повну інтерактивну сторінку",
};

function buildNoscript(opts: {
  lang: Lang;
  h1: string;
  description: string;
  body: string;
  canonical: string;
}): string {
  const { lang, h1, description, body, canonical } = opts;
  const dir = ["fa", "ur", "he"].includes(lang) ? 'dir="rtl"' : "";
  return `    <noscript>
      <div ${dir} style="max-width:1100px;margin:0 auto;padding:32px 20px;font-family:system-ui,sans-serif;color:#0f172a;background:#fff;line-height:1.7">
        <h1 style="font-size:32px;margin:0 0 12px">${escapeHtml(h1)}</h1>
        <p style="font-size:18px;color:#334155">${escapeHtml(description)}</p>
        ${body}
        <p style="margin-top:24px"><a href="${escapeHtml(canonical)}" style="color:#0ea5e9">${escapeHtml(NOSCRIPT_OPEN_LABEL[lang])}</a></p>
        <nav style="margin-top:24px;font-size:14px;color:#64748b">
          ${escapeHtml(NOSCRIPT_NAV_LABEL[lang])}<a href="/">Home</a> · <a href="/affiliates">Affiliates</a> · <a href="/partners">Partners</a> · <a href="/referral">Referral</a> · <a href="/lend">Lend &amp; Earn</a> · <a href="/private-transfer">Private Transfer</a> · <a href="/permanent-bridge">Permanent Bridge</a> · <a href="/about">About</a> · <a href="/compliance">Compliance</a> · <a href="/blog">Blog</a>
        </nav>
      </div>
    </noscript>`;
}

export function prerenderStaticRoutes(outDir = "dist"): Plugin {
  return {
    name: "prerender-static-routes",
    apply: "build",
    closeBundle() {
      const log = (m: string) => console.log(`[prerender] ${m}`);
      const shellPath = join(outDir, "index.html");
      if (!existsSync(shellPath)) {
        log(`✗ ${shellPath} not found, skipping prerender`);
        return;
      }
      const shell = readFileSync(shellPath, "utf8");
      let written = 0;

      for (const lang of LANGS) {
        for (const routeKey of Object.keys(STATIC_ROUTE_SEO) as StaticRouteKey[]) {
          const seoForLang = STATIC_ROUTE_SEO[routeKey][lang] ?? STATIC_ROUTE_SEO[routeKey].en;
          const routePath = routeKey; // e.g. "/" or "/affiliates"
          const langPrefix = lang === "en" ? "" : `/${lang}`;
          const fullPath = `${langPrefix}${routePath === "/" ? "" : routePath}`;
          // Canonical always points to the English version per project SEO strategy
          const canonical = `${SITE}${routePath}`;
          const targetPath = routePath === "/" && lang === "en"
            ? join(outDir, "index.html")
            : join(outDir, `${fullPath.replace(/^\//, "")}/index.html`);

          const head = buildHead({
            lang,
            title: seoForLang.title,
            description: seoForLang.description,
            canonical,
            routePath,
            jsonLd: seoForLang.jsonLd,
          });
          const noscript = buildNoscript({
            h1: seoForLang.h1,
            description: seoForLang.description,
            body: seoForLang.bodyHtml,
            canonical,
          });

          // Strip the shell's default <title>, <meta description>, canonical,
          // hreflang, and og:* tags so per-route values don't conflict.
          let html = shell.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"`);
          html = html.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
          html = html.replace(/<meta\s+name="description"[^>]*>\s*/gi, "");
          html = html.replace(/<meta\s+name="robots"[^>]*>\s*/gi, "");
          html = html.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "");
          html = html.replace(/<link\s+rel="alternate"\s+hreflang[^>]*>\s*/gi, "");
          html = html.replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, "");
          html = html.replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, "");
          html = html.replace(/<\/head>/i, `${head}\n  </head>`);
          html = html.replace(/<body([^>]*)>/i, `<body$1>\n${noscript}`);

          mkdirSync(dirname(targetPath), { recursive: true });
          writeFileSync(targetPath, html, "utf8");
          written++;
        }
      }
      log(`✓ Wrote ${written} prerendered HTML files (${Object.keys(STATIC_ROUTE_SEO).length} routes × ${LANGS.length} languages).`);
    },
  };
}
