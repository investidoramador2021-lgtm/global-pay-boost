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
}

export interface GuardarianMinMax {
  from: string;
  to: string;
  min: number;
  max: number;
}

async function callGuardarian(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('guardarian', {
    method: 'POST',
    body,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function getGuardarianCurrencies(): Promise<GuardarianCurrenciesResponse> {
  return callGuardarian({ action: 'currencies' });
}

export async function getGuardarianEstimate(params: {
  from_currency: string;
  to_currency: string;
  from_network?: string;
  to_network?: string;
  from_amount?: string;
  to_amount?: string;
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
  payout_address: string;
  email?: string;
  redirects?: { successful?: string; cancelled?: string; failed?: string };
}) {
  return callGuardarian({ action: 'create-transaction', ...params });
}
