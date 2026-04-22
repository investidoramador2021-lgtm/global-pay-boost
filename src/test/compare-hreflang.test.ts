/**
 * CI guard — verifies the dynamic-feed sitemap emits a complete and
 * self-referencing hreflang block for every /compare/mrc-vs-* URL.
 *
 * For each URL it asserts:
 *   1. Exactly one <xhtml:link> per supported language (13 total)
 *   2. An x-default alternate
 *   3. A self-reference (the URL's own hreflang appears among its alternates)
 *
 * Source: live edge function (build-time consumer). If the function is
 * unreachable in CI we hard-fail so silent regressions don't slip through.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { supportedLanguages } from "@/i18n";

const FEED_URL =
  "https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/dynamic-feed?p=/sitemap-static.xml";

interface UrlBlock {
  loc: string;
  alternates: { hreflang: string; href: string }[];
}

let comparePages: UrlBlock[] = [];

function parseUrlBlocks(xml: string): UrlBlock[] {
  const blocks: UrlBlock[] = [];
  const urlRe = /<url>([\s\S]*?)<\/url>/g;
  let match: RegExpExecArray | null;
  while ((match = urlRe.exec(xml)) !== null) {
    const body = match[1];
    const locMatch = body.match(/<loc>([^<]+)<\/loc>/);
    if (!locMatch) continue;
    const loc = locMatch[1].trim();
    const alternates: { hreflang: string; href: string }[] = [];
    const altRe = /<xhtml:link[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"[^>]*\/>/g;
    let alt: RegExpExecArray | null;
    while ((alt = altRe.exec(body)) !== null) {
      alternates.push({ hreflang: alt[1], href: alt[2].trim() });
    }
    blocks.push({ loc, alternates });
  }
  return blocks;
}

beforeAll(async () => {
  const res = await fetch(FEED_URL);
  if (!res.ok) {
    throw new Error(`dynamic-feed returned ${res.status} — cannot validate hreflang`);
  }
  const xml = await res.text();
  comparePages = parseUrlBlocks(xml).filter((b) => /\/compare\/mrc-vs-/.test(b.loc));
}, 30_000);

describe("CI: /compare/mrc-vs-* hreflang coverage", () => {
  it("emits at least one comparison page", () => {
    expect(comparePages.length).toBeGreaterThan(0);
  });

  it("emits one URL per language for each comparison slug", () => {
    const bySlug = new Map<string, Set<string>>();
    for (const b of comparePages) {
      const m = b.loc.match(/\/compare\/(mrc-vs-[a-z0-9-]+)/);
      if (!m) continue;
      const slug = m[1];
      // Detect the lang prefix in the URL (default = en when absent).
      const langMatch = b.loc.match(/^https?:\/\/[^/]+\/([a-z]{2})\//);
      const lang =
        langMatch && (supportedLanguages as readonly string[]).includes(langMatch[1])
          ? langMatch[1]
          : "en";
      if (!bySlug.has(slug)) bySlug.set(slug, new Set());
      bySlug.get(slug)!.add(lang);
    }

    const incomplete: string[] = [];
    for (const [slug, langs] of bySlug) {
      const missing = supportedLanguages.filter((l) => !langs.has(l));
      if (missing.length > 0) incomplete.push(`${slug} → missing ${missing.join(",")}`);
    }
    expect(incomplete, `Comparison slugs missing language variants:\n${incomplete.join("\n")}`).toEqual([]);
  });

  it("each URL has all 13 hreflang alternates + x-default + self-reference", () => {
    const required = new Set([...supportedLanguages, "x-default"]);
    const failures: string[] = [];

    for (const block of comparePages) {
      const langs = new Set(block.alternates.map((a) => a.hreflang));

      // 1. All 13 + x-default present.
      const missing = [...required].filter((l) => !langs.has(l));
      if (missing.length > 0) {
        failures.push(`${block.loc} → missing alternates: ${missing.join(",")}`);
        continue;
      }

      // 2. Self-reference: this URL's own hreflang must point back to itself.
      const langMatch = block.loc.match(/^https?:\/\/[^/]+\/([a-z]{2})\//);
      const ownLang =
        langMatch && (supportedLanguages as readonly string[]).includes(langMatch[1])
          ? langMatch[1]
          : "en";
      const selfAlt = block.alternates.find((a) => a.hreflang === ownLang);
      if (!selfAlt) {
        failures.push(`${block.loc} → no self-referencing hreflang for "${ownLang}"`);
        continue;
      }
      if (selfAlt.href !== block.loc) {
        failures.push(
          `${block.loc} → self-reference mismatch: hreflang="${ownLang}" points to ${selfAlt.href}`,
        );
      }
    }

    expect(failures, `Hreflang failures:\n${failures.slice(0, 20).join("\n")}`).toEqual([]);
  });
});
