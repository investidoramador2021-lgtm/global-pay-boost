import { supabase } from "@/integrations/supabase/client";

export interface GuardarianCurrency {
  id: number;
  currency_type: "CRYPTO" | "FIAT";
  ticker: string;
  name: string;
  enabled: boolean;
  is_available: boolean;
  is_stable: boolean;
  is_featured: boolean;
  has_external_id: boolean;
  default_exchange_value: number;
  networks: {
    name: string;
    network: string;
    logo_url: string;
    payment_methods: { type: string; payment_category: string; deposit_enabled: boolean; withdrawal_enabled: boolean }[];
  }[];
  payment_methods: { type: string; payment_category: string; deposit_enabled: boolean; withdrawal_enabled: boolean }[];
}

export interface GuardarianCurrenciesResponse {
  crypto_currencies: GuardarianCurrency[];
  fiat_currencies: GuardarianCurrency[];
}

export interface GuardarianEstimate {
  to_currency: string;
  from_currency: string;
  to_network: string | null;
  from_network: string | null;
  value: string;
  estimated_exchange_rate: string;
  converted_amount?: { amount: string; currency: string };
  network_fee?: { amount: string; currency: string };
  service_fees?: { amount: string; currency: string; name: string; percentage: string }[];
  error?: string;
  fallback?: boolean;
}

export interface GuardarianTransaction {
  id: string;
  status: string;
  checkout_url?: string;
  redirect_url: string;
  from_currency: string;
  to_currency: string;
  expected_from_amount: string;
  expected_to_amount: string;
  from_amount: string;
  to_amount: string | null;
  estimate_breakdown?: {
    convertedAmount?: { amount: string; currency: string };
    estimatedExchangeRate?: string;
    networkFee?: { amount: string; currency: string };
    serviceFees?: { amount: string; currency: string; name: string; percentage: string }[];
  };
}

export interface GuardarianMinMax {
  from: string;
  to: string;
  min: number;
  max: number;
}

export interface GuardarianPaymentMethod {
  type: string;
  payment_method?: string;
  payment_category: string;
  deposit_enabled: boolean;
  withdrawal_enabled: boolean;
}

export interface GuardarianBankDetails {
  receiver_iban: string;
  receiver_bic: string;
}

async function callGuardarian(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('guardarian', {
    method: 'POST',
    body,
  });
  if (error) throw new Error(error.message || 'Failed to reach the payment service');
  return data;
}

export async function getGuardarianCurrencies(): Promise<GuardarianCurrenciesResponse> {
  return callGuardarian({ action: 'currencies' });
}

// getGuardarianPartnerToken removed — API key must never be exposed to the client

export async function getGuardarianPaymentMethods(currency: string, currencyType?: string): Promise<GuardarianPaymentMethod[]> {
  const data = await callGuardarian({ action: 'payment-methods', currency, currency_type: currencyType });
  return data?.payment_methods || data || [];
}

export async function getGuardarianEstimate(params: {
  from_currency: string;
  to_currency: string;
  from_network?: string;
  to_network?: string;
  from_amount?: string;
  to_amount?: string;
  payment_method?: string;
}): Promise<GuardarianEstimate> {
  return callGuardarian({ action: 'estimate', ...params });
}

export async function getGuardarianMinMax(params: {
  from_currency: string;
  to_currency: string;
  from_network?: string;
  to_network?: string;
}): Promise<GuardarianMinMax> {
  return callGuardarian({ action: 'min-max', ...params });
}

export async function createGuardarianTransaction(params: {
  from_amount: number;
  from_currency: string;
  to_currency: string;
  from_network?: string;
  to_network?: string;
  payout_address?: string;
  bank_details?: GuardarianBankDetails;
  deposit_address?: string;
  email?: string;
  payment_method?: string;
}) {
  return callGuardarian({ action: 'create-transaction', ...params });
}

/** @deprecated Use createGuardarianTransaction for both buy and sell */
export const createGuardarianSellTransaction = createGuardarianTransaction;
