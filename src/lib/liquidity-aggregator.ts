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
  altAmount?: number | null; // Loser's amount, for badge display
  isBestRate?: boolean;      // True when LE wins (i.e., not the default cn)
}

export interface AggregatedTransaction extends TransactionResult {
  provider: Provider;
}

const POSITIVE = (n: unknown): number =>
  typeof n === "number" && isFinite(n) && n > 0 ? n : 0;

/**
 * Get best estimate from both providers in parallel.
 * Picks the provider with the highest estimated output.
 * Falls back gracefully if one provider errors.
 */
export async function getBestEstimate(
  from: string,
  to: string,
  amount: string,
  fixedRate = false
): Promise<AggregatedEstimate> {
  const [cnRes, leRes] = await Promise.allSettled([
    cnGetEstimate(from, to, amount, fixedRate),
    leGetEstimate(from, to, amount),
  ]);

  const cn = cnRes.status === "fulfilled" ? cnRes.value : null;
  const le = leRes.status === "fulfilled" ? leRes.value : null;

  const cnAmt = POSITIVE(cn?.estimatedAmount);
  const leAmt = POSITIVE(le?.estimatedAmount);

  // Both failed → return cn shape with null
  if (!cnAmt && !leAmt) {
    return {
      estimatedAmount: cn?.estimatedAmount ?? null as any,
      transactionSpeedForecast: cn?.transactionSpeedForecast ?? null as any,
      warningMessage: cn?.warningMessage || le?.warningMessage || "Rate unavailable.",
      provider: "cn",
      isBestRate: false,
    };
  }

  // LE wins
  if (leAmt > cnAmt) {
    return {
      estimatedAmount: leAmt,
      transactionSpeedForecast: le!.transactionSpeedForecast,
      warningMessage: le!.warningMessage,
      provider: "le",
      altAmount: cnAmt || null,
      isBestRate: true,
    };
  }

  // CN wins (or tie → prefer cn for partner attribution stability)
  return {
    estimatedAmount: cnAmt,
    transactionSpeedForecast: cn!.transactionSpeedForecast,
    warningMessage: cn!.warningMessage,
    provider: "cn",
    altAmount: leAmt || null,
    isBestRate: false,
  };
}

/**
 * Get min amount — prefers ChangeNOW (canonical source), falls back to LE.
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
