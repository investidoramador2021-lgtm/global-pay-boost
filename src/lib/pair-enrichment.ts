/**
 * Curated, fully-translated enrichment for the highest-potential pair pages.
 *
 * Source data lives in `pair-enrichment-data.json` (~12 MB across 13 langs and
 * 470+ pairs). Importing it statically bloats the DynamicExchange chunk to
 * 11+ MB and freezes the preview, so we lazy-load it on demand and cache the
 * parsed object in memory for the rest of the session.
 */

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
type PairDataMap = Record<string, LangMap>;

let cache: PairDataMap | null = null;
let inflight: Promise<PairDataMap> | null = null;

async function loadPairData(): Promise<PairDataMap> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = import("./pair-enrichment-data.json").then((mod) => {
    cache = (mod.default ?? mod) as PairDataMap;
    inflight = null;
    return cache;
  });
  return inflight;
}

/**
 * Async lookup — returns the localized enrichment for the given pair, or null.
 * Falls back to English when the requested language slot is missing.
 */
export async function getPairEnrichment(
  from: string,
  to: string,
  lang: SupportedLanguage,
): Promise<PairEnrichment | null> {
  const data = await loadPairData();
  const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
  const entry = data[key];
  if (!entry) return null;
  return entry[lang] || entry.en;
}

/** Synchronous lookup — only returns a value once the data has been loaded. */
export function getPairEnrichmentSync(
  from: string,
  to: string,
  lang: SupportedLanguage,
): PairEnrichment | null {
  if (!cache) return null;
  const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
  const entry = cache[key];
  if (!entry) return null;
  return entry[lang] || entry.en;
}

/** Kicks off the lazy load (fire-and-forget). */
export function preloadPairEnrichment(): void {
  void loadPairData();
}
