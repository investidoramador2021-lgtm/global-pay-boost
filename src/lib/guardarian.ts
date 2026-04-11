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
  details?: {
    message?: string;
    code?: string;
    [key: string]: unknown;
  } | null;
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
  receiver_iban?: string;
  receiver_bic?: string;
  pix_key?: string;
  clabe?: string;
  account_number?: string;
  sort_code?: string;
  [key: string]: string | undefined;
}

// Dynamic payout field definitions per fiat currency for the Sell flow
export interface PayoutFieldDef {
  key: string;
  label: string;
  placeholder: string;
  validate: (value: string) => boolean;
  sanitize?: (value: string) => string;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "email" | "tel";
}

function stripNonAlphanumeric(v: string): string {
  return v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function stripNonDigits(v: string): string {
  return v.replace(/\D/g, "");
}

// Detect PIX key format and validate accordingly
function isValidPixKey(raw: string): boolean {
  const v = raw.replace(/[\s.\-]/g, "");
  if (!v) return false;
  // Email
  if (v.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  // Phone (+55...)
  if (v.startsWith("+")) return /^\+\d{10,15}$/.test(v);
  // CPF (11 digits)
  if (/^\d{11}$/.test(v)) return true;
  // CNPJ (14 digits)
  if (/^\d{14}$/.test(v)) return true;
  // Random key (UUID)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) return true;
  return false;
}

function sanitizePixKey(raw: string): string {
  return raw.trim().replace(/[\s.-]/g, "");
}

export function getPayoutFieldsForCurrency(ticker: string): PayoutFieldDef[] {
  switch (ticker.toUpperCase()) {
    case "EUR":
      return [
        {
          key: "receiver_iban",
          label: "IBAN",
          placeholder: "DE89 3704 0044 0532 0130 00",
          validate: (v) => {
            const n = stripNonAlphanumeric(v);
            return n.length >= 15 && n.length <= 34 && /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(n);
          },
          sanitize: stripNonAlphanumeric,
          maxLength: 42,
        },
        {
          key: "receiver_bic",
          label: "BIC / SWIFT",
          placeholder: "COBADEFFXXX",
          validate: (v) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(stripNonAlphanumeric(v)),
          sanitize: stripNonAlphanumeric,
          maxLength: 11,
        },
      ];
    case "BRL":
      return [
        {
          key: "pix_key",
          label: "PIX Key (Email, Phone, or CPF)",
          placeholder: "123.456.789-09 or email@example.com",
          validate: isValidPixKey,
          sanitize: sanitizePixKey,
          maxLength: 100,
        },
      ];
    case "MXN":
      return [
        {
          key: "clabe",
          label: "18-digit CLABE Number",
          placeholder: "012345678901234567",
          validate: (v) => /^\d{18}$/.test(stripNonDigits(v)),
          sanitize: stripNonDigits,
          maxLength: 18,
          inputMode: "numeric",
        },
      ];
    case "GBP":
      return [
        {
          key: "account_number",
          label: "Account Number",
          placeholder: "12345678",
          validate: (v) => /^\d{8}$/.test(stripNonDigits(v)),
          sanitize: stripNonDigits,
          maxLength: 8,
          inputMode: "numeric",
        },
        {
          key: "sort_code",
          label: "Sort Code",
          placeholder: "12-34-56",
          validate: (v) => /^\d{6}$/.test(stripNonDigits(v)),
          sanitize: stripNonDigits,
          maxLength: 8,
          inputMode: "numeric",
        },
      ];
    default:
      // For other fiat currencies, ask for IBAN as a fallback — Guardarian handles routing
      return [
        {
          key: "receiver_iban",
          label: "Bank Account / IBAN",
          placeholder: "Your bank account number or IBAN",
          validate: (v) => v.trim().length >= 8,
          maxLength: 42,
        },
      ];
  }
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
  side?: "buy" | "sell";
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
  payout_currency?: string;
  from_network?: string;
  to_network?: string;
  payout_address?: string;
  bank_details?: GuardarianBankDetails;
  deposit_address?: string;
  email?: string;
  payment_method?: string;
  side?: "buy" | "sell";
  trade_direction?: "buy" | "sell";
}) {
  return callGuardarian({ action: 'create-transaction', ...params });
}

/** @deprecated Use createGuardarianTransaction for both buy and sell */
export const createGuardarianSellTransaction = createGuardarianTransaction;
