import { supabase } from "@/integrations/supabase/client";
import type { Currency, EstimateResult, MinAmountResult, CreateTransactionParams, TransactionResult, TransactionStatus } from "./changenow";

async function callSS(params: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: object) {
  if (method === 'POST') {
    const { data, error } = await supabase.functions.invoke('simpleswap', {
      method: 'POST',
      body: { ...body, _action: params.action },
    });
    if (error) throw new Error(error.message);
    return data;
  }
  const { data, error } = await supabase.functions.invoke('simpleswap', {
    method: 'POST',
    body: { _get: true, ...params },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function ssGetCurrencies(): Promise<Currency[]> {
  try {
    const data = await callSS({ action: 'currencies' });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function ssGetMinAmount(from: string, to: string): Promise<MinAmountResult> {
  return callSS({ action: 'min-amount', from, to });
}

export async function ssGetRanges(from: string, to: string): Promise<{ minAmount: number; maxAmount: number | null }> {
  return callSS({ action: 'ranges', from, to });
}

export async function ssGetEstimate(from: string, to: string, amount: string): Promise<EstimateResult> {
  return callSS({ action: 'estimate', from, to, amount });
}

export async function ssCreateTransaction(params: CreateTransactionParams): Promise<TransactionResult> {
  return callSS({ action: 'create-transaction' }, 'POST', params);
}

export async function ssGetTransactionStatus(id: string): Promise<TransactionStatus> {
  return callSS({ action: 'tx-status', id });
}
