import { supabase } from "@/integrations/supabase/client";
import type { Currency, EstimateResult, MinAmountResult, CreateTransactionParams, TransactionResult, TransactionStatus } from "./changenow";

async function callSE(params: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: object) {
  if (method === 'POST') {
    const { data, error } = await supabase.functions.invoke('stealthex', {
      method: 'POST',
      body: { ...body, _action: params.action },
    });
    if (error) throw new Error(error.message);
    return data;
  }
  const { data, error } = await supabase.functions.invoke('stealthex', {
    method: 'POST',
    body: { _get: true, ...params },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function seGetCurrencies(): Promise<Currency[]> {
  return callSE({ action: 'currencies' });
}

export async function seGetMinAmount(from: string, to: string): Promise<MinAmountResult> {
  return callSE({ action: 'min-amount', from, to });
}

export async function seGetEstimate(from: string, to: string, amount: string): Promise<EstimateResult> {
  return callSE({ action: 'estimate', from, to, amount });
}

export async function seCreateTransaction(params: CreateTransactionParams): Promise<TransactionResult> {
  return callSE({ action: 'create-transaction' }, 'POST', params);
}

export async function seGetTransactionStatus(id: string): Promise<TransactionStatus> {
  return callSE({ action: 'tx-status', id });
}
