/**
 * LiquidityAggregator — Priority Waterfall across StealthEX (se) > LetsExchange (le) > ChangeNOW (cn).
 *
 * Strategy:
 *   Priority 1 (Lead): StealthEX — highest margin, always tried first.
 *   Priority 2 (Fallback): LetsExchange — used when SE cannot quote.
 *   Priority 3 (Reserved): ChangeNOW — last-resort coverage extension.
 *
 * Failover on create-transaction is silent. Quote stage walks the waterfall and
 * picks the first provider returning a positive estimate.
 *
 * Brand integrity: Provider names never leak to UI. Internal codes only:
 *   'se' = StealthEX, 'le' = LetsExchange, 'cn' = ChangeNOW.
 */
import {
  getEstimate as cnGetEstimate,
  getMinAmount as cnGetMinAmount,
  createTransaction as cnCreateTransaction,
  getTransactionStatus as cnGetStatus,
  type EstimateResult,
  type MinAmountResult,
  type CreateTransactionParams,
  type TransactionResult,
  type TransactionStatus,
} from "./changenow";
import {
  leGetEstimate,
  leGetMinAmount,
  leCreateTransaction,
  leGetTransactionStatus,
} from "./letsexchange";
import {
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
  // Priority 1: StealthEX
  let se: EstimateResult | null = null;
  try { se = await seGetEstimate(from, to, amount); } catch {}
  const seAmt = POSITIVE(se?.estimatedAmount);
  if (seAmt > 0) {
    return {
      estimatedAmount: seAmt,
      transactionSpeedForecast: se!.transactionSpeedForecast,
      warningMessage: se!.warningMessage,
      provider: "se",
      isBestRate: true,
      coverageFallback: false,
    };
  }

  // Priority 2: LetsExchange
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

  // Priority 3: ChangeNOW (reserved coverage)
  let cn: EstimateResult | null = null;
  try { cn = await cnGetEstimate(from, to, amount, fixedRate); } catch {}
  const cnAmt = POSITIVE(cn?.estimatedAmount);
  if (cnAmt > 0) {
    return {
      estimatedAmount: cnAmt,
      transactionSpeedForecast: cn!.transactionSpeedForecast,
      warningMessage: cn!.warningMessage,
      provider: "cn",
      isBestRate: false,
      coverageFallback: true,
    };
  }

  return {
    estimatedAmount: null as any,
    transactionSpeedForecast: null as any,
    warningMessage: se?.warningMessage || le?.warningMessage || cn?.warningMessage || "Rate unavailable.",
    provider: "se",
    isBestRate: false,
  };
}

/**
 * Get min amount — waterfall SE → LE → CN.
 */
export async function getBestMinAmount(
  from: string,
  to: string,
  fixedRate = false
): Promise<MinAmountResult> {
  try {
    const r = await seGetMinAmount(from, to);
    if (r?.minAmount && r.minAmount > 0) return r;
  } catch {}
  try {
    const r = await leGetMinAmount(from, to);
    if (r?.minAmount && r.minAmount > 0) return r;
  } catch {}
  try {
    return await cnGetMinAmount(from, to, fixedRate);
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
  preferredProvider: Provider = "se"
): Promise<AggregatedTransaction> {
  // Build waterfall with the preferred provider first, then the rest in priority order.
  const PRIORITY: Provider[] = ["se", "le", "cn"];
  const order: Provider[] = [preferredProvider, ...PRIORITY.filter(p => p !== preferredProvider)];

  const tryProvider = async (p: Provider): Promise<AggregatedTransaction | null> => {
    try {
      const tx =
        p === "se" ? await seCreateTransaction(params) :
        p === "le" ? await leCreateTransaction(params) :
        await cnCreateTransaction(params);
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
 * Defaults to StealthEX (current Priority 1) if no provider info.
 */
export async function getStatusByProvider(
  id: string,
  provider: Provider = "se"
): Promise<TransactionStatus> {
  if (provider === "se") return seGetTransactionStatus(id);
  if (provider === "le") return leGetTransactionStatus(id);
  return cnGetStatus(id);
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
