/**
 * Curated, fully-translated enrichment for the highest-potential pair pages.
 *
 * Source data lives in `pair-enrichment-data.json` — each pair has copy in all
 * 13 supported languages (en, es, pt, fr, ja, fa, ur, he, af, hi, vi, tr, uk).
 * Translations were generated via Lovable AI Gateway (gemini-2.5-flash) with a
 * crypto-aware prompt that preserves tickers, brand names, and numeric facts.
 *
 * Render path:
 *   DynamicExchange.tsx → if getPairEnrichment(from, to, lang) returns an
 *   entry, <PairEnrichmentBlock /> renders the localized block between the
 *   widget and the existing "How it works" section.
 *
 * To add more pairs: append the EN entry, run scripts/translate-pairs.mjs,
 * commit the regenerated JSON.
 */

import data from "./pair-enrichment-data.json";
import type { SupportedLanguage } from "@/i18n";

export interface PairStep {
  title: string;
  description: string;
}

export interface PairNotes {
  fees: string;
  speed: string;
  minimum: string;
}

export interface PairLink {
  from: string;
  to: string;
  label: string;
}

export interface PairEnrichment {
  intro: string;
  steps: PairStep[];
  notes: PairNotes;
  peopleAlso: PairLink[];
}

type LangMap = Partial<Record<SupportedLanguage, PairEnrichment>> & { en: PairEnrichment };

const PAIR_DATA = data as Record<string, LangMap>;

/**
 * Returns the enrichment block for the given pair in the requested language.
 * Falls back to English if the language slot is missing (defensive — every
 * pair in the JSON ships with all 13 languages today).
 */
export function getPairEnrichment(
  from: string,
  to: string,
  lang: SupportedLanguage,
): PairEnrichment | null {
  const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
  const entry = PAIR_DATA[key];
  if (!entry) return null;
  return entry[lang] || entry.en;
}

export const ENRICHED_PAIR_COUNT = Object.keys(PAIR_DATA).length;
export const ENRICHED_PAIR_SLUGS = Object.keys(PAIR_DATA);
