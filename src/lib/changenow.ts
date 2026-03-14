import { supabase } from "@/integrations/supabase/client";

export interface Currency {
  ticker: string;
  name: string;
  image: string;
  hasExternalId: boolean;
  isFiat: boolean;
  featured: boolean;
  isStable: boolean;
  supportsFixedRate: boolean;
  network: string;
  tokenContract: string | null;
}

export interface EstimateResult {
  estimatedAmount: number;
  transactionSpeedForecast: string;
  warningMessage: string | null;
}

export interface MinAmountResult {
  minAmount: number;
}

export interface CreateTransactionParams {
  from: string;
  to: string;
  amount: number;
  address: string;
  extraId?: string;
  refundAddress?: string;
  refundExtraId?: string;
}

export interface TransactionResult {
  id: string;
  payinAddress: string;
  payoutAddress: string;
  payinExtraId?: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  payoutExtraId?: string;
}

export interface TransactionStatus {
  id: string;
  status: string;
  payinAddress: string;
  payoutAddress: string;
  fromCurrency: string;
  toCurrency: string;
  amountSend: number | null;
  amountReceive: number | null;
  payinHash: string | null;
  payoutHash: string | null;
}

async function callChangeNow(params: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: object) {
  const queryString = new URLSearchParams(params).toString();
  
  if (method === 'POST') {
    const { data, error } = await supabase.functions.invoke('changenow', {
      method: 'POST',
      body: { ...body, _action: params.action },
      headers: { 'Content-Type': 'application/json' },
    });
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase.functions.invoke(`changenow?${queryString}`, {
    method: 'GET',
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function getCurrencies(): Promise<Currency[]> {
  return callChangeNow({ action: 'currencies' });
}

export async function getMinAmount(from: string, to: string): Promise<MinAmountResult> {
  return callChangeNow({ action: 'min-amount', from, to });
}

export async function getEstimate(from: string, to: string, amount: string): Promise<EstimateResult> {
  return callChangeNow({ action: 'estimate', from, to, amount });
}

export async function createTransaction(params: CreateTransactionParams): Promise<TransactionResult> {
  return callChangeNow({ action: 'create-transaction' }, 'POST', params);
}

export async function getTransactionStatus(id: string): Promise<TransactionStatus> {
  return callChangeNow({ action: 'tx-status', id });
}
