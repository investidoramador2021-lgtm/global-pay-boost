/**
 * LiquidityAggregator — Priority Waterfall: ChangeNOW (cn) → StealthEX (se) → LetsExchange (le).
 *
 * Strategy:
 *   Priority 1 (Lead): ChangeNOW — primary provider, best margins.
 *   Priority 2 (Fallback): StealthEX — second tier coverage.
 *   Priority 3 (Reserved): LetsExchange — last-resort coverage extender.
 *
 * Failover on create-transaction is silent. Quote stage walks the waterfall and
 * picks the first provider returning a positive estimate, guaranteeing at least
 * one quote whenever any provider can serve the pair.
 *
 * Brand integrity: Provider names never leak to UI. Internal codes only:
 *   'cn' = ChangeNOW, 'se' = StealthEX, 'le' = LetsExchange.
 */
import {
  getCurrencies as cnGetCurrencies,
  getEstimate as cnGetEstimate,
  getMinAmount as cnGetMinAmount,
  createTransaction as cnCreateTransaction,
  getTransactionStatus as cnGetStatus,
  type Currency,
  type EstimateResult,
  type MinAmountResult,
  type CreateTransactionParams,
  type TransactionResult,
  type TransactionStatus,
} from "./changenow";
import {
  leGetCurrencies,
  leGetEstimate,
  leGetMinAmount,
  leCreateTransaction,
  leGetTransactionStatus,
} from "./letsexchange";
import {
  seGetCurrencies,
  seGetEstimate,
  seGetMinAmount,
  seCreateTransaction,
  seGetTransactionStatus,
} from "./stealthex";

export type Provider = "se" | "le" | "cn";

export const PROVIDER_LABELS: Record<Provider, string> = {
  se: "StealthEX",
  le: "LetsExchange",
  cn: "ChangeNOW",
};

export interface AggregatedEstimate extends EstimateResult {
  provider: Provider;
  altAmount?: number | null; // Other provider's amount, for badge display
  isBestRate?: boolean;      // True when LE is used (coverage extension)
  coverageFallback?: boolean; // True when CN couldn't quote and LE filled in
}

export interface AggregatedTransaction extends TransactionResult {
  provider: Provider;
}

const POSITIVE = (n: unknown): number =>
  typeof n === "number" && isFinite(n) && n > 0 ? n : 0;

/**
 * Aggregate the union of supported currencies from all providers.
 * Priority for metadata (name, image, etc.) when the same ticker exists in multiple providers:
 *   ChangeNOW (cn) > StealthEX (se) > LetsExchange (le).
 * This guarantees consistent text + logo while still surfacing tokens that are
 * only available on SE or LE (coverage extension).
 *
 * Failures from any single provider are silent — we still return whatever we have.
 */
export async function getAggregatedCurrencies(): Promise<Currency[]> {
  const settle = async <T,>(p: Promise<T>): Promise<T | null> => {
    try { return await p; } catch { return null; }
  };

  const [cnRaw, seRaw, leRaw] = await Promise.all([
    settle(cnGetCurrencies()),
    settle(seGetCurrencies()),
    settle(leGetCurrencies()),
  ]);

  const toArray = (raw: unknown): Currency[] => {
    if (Array.isArray(raw)) return raw as Currency[];
    if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
      return (raw as { data: Currency[] }).data;
    }
    return [];
  };

  const cn = toArray(cnRaw);
  const se = toArray(seRaw);
  const le = toArray(leRaw);

  // Merge by ticker, preferring CN metadata. Fill empty fields from lower-priority sources.
  const merged = new Map<string, Currency>();

  const upsert = (c: Currency, source: Provider) => {
    if (!c?.ticker) return;
    const key = c.ticker.toLowerCase();
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...c, ticker: key, isFiat: !!c.isFiat });
      return;
    }
    // Backfill missing metadata from lower-priority sources for consistency.
    merged.set(key, {
      ...existing,
      name: existing.name || c.name,
      image: existing.image || c.image,
      network: existing.network || c.network,
      tokenContract: existing.tokenContract || c.tokenContract,
      hasExternalId: existing.hasExternalId || c.hasExternalId,
      isStable: existing.isStable || c.isStable,
      featured: existing.featured || c.featured,
      supportsFixedRate: existing.supportsFixedRate || c.supportsFixedRate,
    });
  };

  // Order matters: CN first → wins on collisions.
  cn.forEach((c) => upsert(c, "cn"));
  se.forEach((c) => upsert(c, "se"));
  le.forEach((c) => upsert(c, "le"));

  return Array.from(merged.values()).filter((c) => !c.isFiat);
}
/**
 * Get best estimate using ChangeNOW-first coverage routing.
 * - If CN returns a valid positive amount → use CN (always, regardless of LE).
 * - If CN fails or returns 0/null → fall back to LE for coverage.
 * This protects margin while expanding the supported-token surface.
 */
export async function getBestEstimate(
  from: string,
  to: string,
  amount: string,
  fixedRate = false
): Promise<AggregatedEstimate> {
  // Priority 1: ChangeNOW
  let cn: EstimateResult | null = null;
  try { cn = await cnGetEstimate(from, to, amount, fixedRate); } catch {}
  const cnAmt = POSITIVE(cn?.estimatedAmount);
  if (cnAmt > 0) {
    return {
      estimatedAmount: cnAmt,
      transactionSpeedForecast: cn!.transactionSpeedForecast,
      warningMessage: cn!.warningMessage,
      provider: "cn",
      isBestRate: true,
      coverageFallback: false,
    };
  }

  // Priority 2: StealthEX
  let se: EstimateResult | null = null;
  try { se = await seGetEstimate(from, to, amount); } catch {}
  const seAmt = POSITIVE(se?.estimatedAmount);
  if (seAmt > 0) {
    return {
      estimatedAmount: seAmt,
      transactionSpeedForecast: se!.transactionSpeedForecast,
      warningMessage: se!.warningMessage,
      provider: "se",
      isBestRate: false,
      coverageFallback: true,
    };
  }

  // Priority 3: LetsExchange
  let le: EstimateResult | null = null;
  try { le = await leGetEstimate(from, to, amount); } catch {}
  const leAmt = POSITIVE(le?.estimatedAmount);
  if (leAmt > 0) {
    return {
      estimatedAmount: leAmt,
      transactionSpeedForecast: le!.transactionSpeedForecast,
      warningMessage: le!.warningMessage,
      provider: "le",
      isBestRate: false,
      coverageFallback: true,
    };
  }

  return {
    estimatedAmount: null as any,
    transactionSpeedForecast: null as any,
    warningMessage: cn?.warningMessage || se?.warningMessage || le?.warningMessage || "Rate unavailable.",
    provider: "cn",
    isBestRate: false,
  };
}

/**
 * Get min amount — waterfall CN → SE → LE.
 */
export async function getBestMinAmount(
  from: string,
  to: string,
  fixedRate = false
): Promise<MinAmountResult> {
  try {
    const r = await cnGetMinAmount(from, to, fixedRate);
    if (r?.minAmount && r.minAmount > 0) return r;
  } catch {}
  try {
    const r = await seGetMinAmount(from, to);
    if (r?.minAmount && r.minAmount > 0) return r;
  } catch {}
  try {
    return await leGetMinAmount(from, to);
  } catch {}
  return { minAmount: 0 };
}

/**
 * Create transaction with the winning provider, with silent failover.
 *
 * @param params - Standard transaction params
 * @param preferredProvider - The provider that won the quote
 * @returns Transaction + provider tag for downstream routing
 */
export async function createBestTransaction(
  params: CreateTransactionParams,
  preferredProvider: Provider = "cn"
): Promise<AggregatedTransaction> {
  // Build waterfall with the preferred provider first, then the rest in priority order.
  const PRIORITY: Provider[] = ["cn", "se", "le"];
  const order: Provider[] = [preferredProvider, ...PRIORITY.filter(p => p !== preferredProvider)];

  const tryProvider = async (p: Provider): Promise<AggregatedTransaction | null> => {
    try {
      const tx =
        p === "cn" ? await cnCreateTransaction(params) :
        p === "se" ? await seCreateTransaction(params) :
        await leCreateTransaction(params);
      if (tx?.id && tx?.payinAddress) return { ...tx, provider: p };
      return null;
    } catch (err) {
      console.warn(`[LiquidityAggregator] ${p} create-tx failed:`, err);
      return null;
    }
  };

  for (let i = 0; i < order.length; i++) {
    const p = order[i];
    const result = await tryProvider(p);
    if (result) {
      if (i > 0) console.warn(`[LiquidityAggregator] Failover → ${p}`);
      return result;
    }
  }

  throw new Error("All liquidity providers unavailable. Please retry.");
}

/**
 * Get tx status from the correct provider based on stored tag.
 * Defaults to ChangeNOW (current Priority 1) if no provider info.
 */
export async function getStatusByProvider(
  id: string,
  provider: Provider = "cn"
): Promise<TransactionStatus> {
  if (provider === "cn") return cnGetStatus(id);
  if (provider === "se") return seGetTransactionStatus(id);
  return leGetTransactionStatus(id);
}

/**
 * Generate an MRC Global Pay-branded transaction ID.
 * Format: MRC-{12 chars} — used as the customer-facing reference.
 */
export function generateMrcTxId(providerId: string): string {
  const slice = (providerId || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MRC-${slice}${rand}`;
}
