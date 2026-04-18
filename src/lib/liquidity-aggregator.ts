/**
 * LiquidityAggregator — Coverage-router across ChangeNOW (cn) + LetsExchange (le).
 *
 * Strategy: ChangeNOW ALWAYS wins when it returns a valid quote (better margin).
 * LetsExchange is used ONLY as a coverage extender — when CN cannot quote the pair
 * (unsupported asset, zero/null amount, or error), LE fills the gap.
 * This expands token coverage without sacrificing primary-provider profits.
 *
 * Failover: Silent on create-transaction. Quote toast surfaces provider switches.
 *
 * Brand integrity: Provider names never leak to UI. We only expose 'cn' | 'le'
 * internally for routing; the customer-facing flow shows MRC Global Pay only.
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

export type Provider = "cn" | "le";

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
  // TEMPORARY: LE primary, CN fallback (per operator request).
  let le: EstimateResult | null = null;
  try {
    le = await leGetEstimate(from, to, amount);
  } catch {}

  const leAmt = POSITIVE(le?.estimatedAmount);

  if (leAmt > 0) {
    return {
      estimatedAmount: leAmt,
      transactionSpeedForecast: le!.transactionSpeedForecast,
      warningMessage: le!.warningMessage,
      provider: "le",
      isBestRate: false,
      coverageFallback: false,
    };
  }

  // LE can't quote → fall back to CN
  let cn: EstimateResult | null = null;
  try {
    cn = await cnGetEstimate(from, to, amount, fixedRate);
  } catch {}

  const cnAmt = POSITIVE(cn?.estimatedAmount);

  if (cnAmt > 0) {
    return {
      estimatedAmount: cnAmt,
      transactionSpeedForecast: cn!.transactionSpeedForecast,
      warningMessage: cn!.warningMessage,
      provider: "cn",
      isBestRate: true,
      coverageFallback: true,
    };
  }

  return {
    estimatedAmount: le?.estimatedAmount ?? null as any,
    transactionSpeedForecast: le?.transactionSpeedForecast ?? null as any,
    warningMessage: le?.warningMessage || cn?.warningMessage || "Rate unavailable.",
    provider: "le",
    isBestRate: false,
  };
}

/**
 * Get min amount — TEMPORARY: prefer LE, fall back to CN.
 */
export async function getBestMinAmount(
  from: string,
  to: string,
  fixedRate = false
): Promise<MinAmountResult> {
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
  preferredProvider: Provider = "cn"
): Promise<AggregatedTransaction> {
  const primary = preferredProvider;
  const secondary: Provider = primary === "cn" ? "le" : "cn";

  const tryProvider = async (p: Provider): Promise<AggregatedTransaction | null> => {
    try {
      const tx =
        p === "cn"
          ? await cnCreateTransaction(params)
          : await leCreateTransaction(params);
      if (tx?.id && tx?.payinAddress) {
        return { ...tx, provider: p };
      }
      return null;
    } catch (err) {
      console.warn(`[LiquidityAggregator] ${p} create-tx failed:`, err);
      return null;
    }
  };

  // Try primary
  const first = await tryProvider(primary);
  if (first) return first;

  // Silent failover to secondary
  console.warn(`[LiquidityAggregator] Failover ${primary} → ${secondary}`);
  const second = await tryProvider(secondary);
  if (second) return second;

  throw new Error("All liquidity providers unavailable. Please retry.");
}

/**
 * Get tx status from the correct provider based on stored tag.
 * Defaults to ChangeNOW if no provider info (backward-compat for legacy txs).
 */
export async function getStatusByProvider(
  id: string,
  provider: Provider = "cn"
): Promise<TransactionStatus> {
  if (provider === "le") {
    return leGetTransactionStatus(id);
  }
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
