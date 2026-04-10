/**
 * Payment Method Logo components — maps raw Guardarian payment_method strings
 * to professional SVG logos / icons. Ensures "Logo-First" UI with adaptive
 * dark/light mode visibility.
 */

// ─── SVG Logo Components ────────────────────────────────────────────
export const VisaLogo = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M293.2 348.73l33.36-195.76h53.34l-33.38 195.76H293.2zm246.11-191.54c-10.57-3.97-27.16-8.21-47.89-8.21-52.77 0-89.94 26.59-90.21 64.64-.54 28.12 26.49 43.81 46.73 53.15 20.79 9.54 27.78 15.65 27.68 24.18-.14 13.07-16.58 19.03-31.94 19.03-21.38 0-32.7-2.96-50.28-10.27l-6.88-3.11-7.49 43.87c12.46 5.48 35.56 10.24 59.53 10.49 56.13 0 92.56-26.27 92.97-66.88.21-22.27-14.02-39.24-44.79-53.22-18.64-9.06-30.08-15.12-29.95-24.29 0-8.14 9.66-16.83 30.55-16.83 17.43-.28 30.06 3.53 39.91 7.49l4.78 2.26 7.28-42.3zm137.31-4.22h-41.27c-12.78 0-22.35 3.49-27.95 16.26L501.41 348.73h56.08s9.16-24.14 11.23-29.43h68.52c1.6 6.88 6.5 29.43 6.5 29.43h49.58l-43.28-195.76h-.38zm-65.83 126.4c4.43-11.32 21.33-54.88 21.33-54.88-.31.52 4.39-11.37 7.1-18.73l3.62 16.92s10.25 46.87 12.4 56.69h-44.45zM258.02 152.97L205.72 286.69l-5.58-27.13c-9.71-31.18-39.95-64.98-73.82-81.89l47.83 171.h56.47l84.04-195.76h-56.64v.06z" fill="#1A1F71"/>
    <path d="M146.92 152.96H60.87l-.68 4.01c66.94 16.21 111.21 55.33 129.58 102.38L171.66 169.4c-3.22-12.35-12.57-16.05-24.74-16.44z" fill="#F9A533"/>
  </svg>
);

export const MastercardLogo = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 152 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="48" cy="50" r="38" fill="#EB001B"/>
    <circle cx="104" cy="50" r="38" fill="#F79E1B"/>
    <path d="M76 21.5C83.93 28.16 89 37.54 89 48s-5.07 19.84-13 26.5C68.07 67.84 63 58.46 63 48s5.07-19.84 13-26.5z" fill="#FF5F00"/>
  </svg>
);

export const SepaLogo = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect rx="6" width="120" height="40" fill="#003DA5"/>
    <text x="60" y="26" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="bold">SEPA</text>
  </svg>
);

export const PixLogo = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect rx="6" width="120" height="40" fill="#32BCAD"/>
    <text x="60" y="26" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="bold">PIX</text>
  </svg>
);

export const SwiftLogo = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect rx="6" width="120" height="40" fill="#E31937"/>
    <text x="60" y="26" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="bold">SWIFT</text>
  </svg>
);

export const FpsLogo = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect rx="6" width="120" height="40" fill="#6B2C91"/>
    <text x="60" y="26" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="bold">FPS</text>
  </svg>
);

export const ApplePayLogo = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect rx="6" width="120" height="40" fill="#000"/>
    <text x="60" y="26" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="bold"> Pay</text>
  </svg>
);

export const GooglePayLogo = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect rx="6" width="120" height="40" fill="#4285F4"/>
    <text x="60" y="26" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="bold">G Pay</text>
  </svg>
);

export const BankTransferIcon = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect rx="6" width="120" height="40" fill="#6366F1"/>
    <text x="60" y="26" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="bold">Bank Transfer</text>
  </svg>
);

export const CardIcon = ({ className = "h-5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect rx="6" width="120" height="40" fill="#475569"/>
    <text x="60" y="26" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="bold">Card</text>
  </svg>
);

// ─── Payment method type → display label + logo mapping ────────────
export interface PaymentMethodDisplay {
  label: string;
  Logo: React.FC<{ className?: string }>;
}

const PAYMENT_METHOD_MAP: Record<string, PaymentMethodDisplay> = {
  "visa": { label: "Visa", Logo: VisaLogo },
  "mastercard": { label: "Mastercard", Logo: MastercardLogo },
  "sepa": { label: "SEPA", Logo: SepaLogo },
  "sepa_instant": { label: "SEPA Instant", Logo: SepaLogo },
  "pix": { label: "PIX", Logo: PixLogo },
  "swift": { label: "SWIFT", Logo: SwiftLogo },
  "faster_payments": { label: "FPS", Logo: FpsLogo },
  "fps": { label: "FPS", Logo: FpsLogo },
  "apple_pay": { label: "Apple Pay", Logo: ApplePayLogo },
  "google_pay": { label: "Google Pay", Logo: GooglePayLogo },
  "bank_transfer": { label: "Bank Transfer", Logo: BankTransferIcon },
  "card_payment": { label: "Card", Logo: CardIcon },
  "credit_card": { label: "Card", Logo: CardIcon },
  "debit_card": { label: "Card", Logo: CardIcon },
};

/**
 * Resolves a raw payment method type string from Guardarian into a
 * display-friendly label and logo component. Falls back to a generic
 * "Bank Transfer" or "Card" icon for unknown types.
 */
export function resolvePaymentMethodDisplay(rawType: string): PaymentMethodDisplay {
  const key = rawType.toLowerCase().trim();
  if (PAYMENT_METHOD_MAP[key]) return PAYMENT_METHOD_MAP[key];

  // Fuzzy matching for variations like "visa7", "visa_card", "banking 1"
  if (key.includes("visa")) return PAYMENT_METHOD_MAP["visa"];
  if (key.includes("mastercard") || key.includes("master_card")) return PAYMENT_METHOD_MAP["mastercard"];
  if (key.includes("sepa")) return PAYMENT_METHOD_MAP["sepa"];
  if (key.includes("pix")) return PAYMENT_METHOD_MAP["pix"];
  if (key.includes("swift")) return PAYMENT_METHOD_MAP["swift"];
  if (key.includes("fps") || key.includes("faster")) return PAYMENT_METHOD_MAP["faster_payments"];
  if (key.includes("apple")) return PAYMENT_METHOD_MAP["apple_pay"];
  if (key.includes("google")) return PAYMENT_METHOD_MAP["google_pay"];
  if (key.includes("bank") || key.includes("transfer") || key.includes("wire")) return PAYMENT_METHOD_MAP["bank_transfer"];
  if (key.includes("card") || key.includes("credit") || key.includes("debit")) return PAYMENT_METHOD_MAP["card_payment"];

  // Ultimate fallback
  return {
    label: rawType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()).replace(/\d+$/, "").trim() || "Payment",
    Logo: BankTransferIcon,
  };
}

/** Smart default payment method for a given fiat ticker */
export function getSmartDefaultMethod(fiatTicker: string): string | null {
  const map: Record<string, string> = {
    BRL: "PIX",
    EUR: "SEPA",
    GBP: "FASTER_PAYMENTS",
    USD: "VISA",
    CAD: "VISA",
    AUD: "VISA",
  };
  return map[fiatTicker?.toUpperCase()] || null;
}
