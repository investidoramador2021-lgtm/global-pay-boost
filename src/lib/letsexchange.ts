import { supabase } from "@/integrations/supabase/client";
import type { Currency, EstimateResult, MinAmountResult, CreateTransactionParams, TransactionResult, TransactionStatus } from "./changenow";

async function callLE(params: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: object) {
  if (method === 'POST') {
    const { data, error } = await supabase.functions.invoke('letsexchange', {
      method: 'POST',
      body: { ...body, _action: params.action },
    });
    if (error) throw new Error(error.message);
    return data;
  }
  const { data, error } = await supabase.functions.invoke('letsexchange', {
    method: 'POST',
    body: { _get: true, ...params },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function leGetCurrencies(): Promise<Currency[]> {
  return callLE({ action: 'currencies' });
}

export async function leGetMinAmount(from: string, to: string): Promise<MinAmountResult> {
  return callLE({ action: 'min-amount', from, to });
}

export async function leGetEstimate(from: string, to: string, amount: string): Promise<EstimateResult> {
  return callLE({ action: 'estimate', from, to, amount });
}

export async function leCreateTransaction(params: CreateTransactionParams): Promise<TransactionResult> {
  return callLE({ action: 'create-transaction' }, 'POST', params);
}

export async function leGetTransactionStatus(id: string): Promise<TransactionStatus> {
  return callLE({ action: 'tx-status', id });
}
