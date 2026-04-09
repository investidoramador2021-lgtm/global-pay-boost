import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Clipboard, Loader2, ShieldAlert } from "lucide-react";

// ── Network types ───────────────────────────────────────────────────

export type AddressNetworkType = "evm" | "btc" | "sol" | "tron" | "unknown";

interface DetectedNetwork {
  name: string;
  shortName: string;
  icon: string;
  type: AddressNetworkType;
}

// ── Address detection ───────────────────────────────────────────────

const BASE58_REGEX = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

function detectNetwork(address: string): DetectedNetwork | null {
  const t = address.trim();
  if (!t) return null;

  // Ethereum / EVM — starts with 0x, exactly 42 hex characters
  if (/^0x[0-9a-fA-F]{40}$/.test(t)) {
    return { name: "Ethereum / EVM", shortName: "ETH", icon: "⟠", type: "evm" };
  }

  // Bitcoin — Legacy (1…), P2SH (3…), Bech32 (bc1…)
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(t)) {
    return { name: "Bitcoin (Legacy)", shortName: "BTC", icon: "₿", type: "btc" };
  }
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(t)) {
    return { name: "Bitcoin (P2SH)", shortName: "BTC", icon: "₿", type: "btc" };
  }
  if (/^bc1[a-zA-HJ-NP-Z0-9]{25,90}$/.test(t)) {
    return { name: "Bitcoin (Bech32)", shortName: "BTC", icon: "₿", type: "btc" };
  }

  // TRON — starts with T, exactly 34 chars, Base58
  if (/^T[a-km-zA-HJ-NP-Z1-9]{33}$/.test(t)) {
    return { name: "TRON (TRC20)", shortName: "TRX", icon: "⟁", type: "tron" };
  }

  // Solana — Base58, 32-44 chars, no 0x or bc1 prefix
  if (t.length >= 32 && t.length <= 44 && !t.startsWith("0x") && !t.startsWith("bc1") && !t.startsWith("T") && BASE58_REGEX.test(t)) {
    return { name: "Solana", shortName: "SOL", icon: "◎", type: "sol" };
  }

  return null;
}

function detectPartialNetwork(address: string): DetectedNetwork | null {
  const t = address.trim();
  if (!t) return null;
  if (t.startsWith("0x") && t.length < 42) return { name: "Ethereum / EVM", shortName: "ETH", icon: "⟠", type: "evm" };
  if (t.startsWith("bc1") && t.length < 26) return { name: "Bitcoin (Bech32)", shortName: "BTC", icon: "₿", type: "btc" };
  if ((t.startsWith("1") || t.startsWith("3")) && t.length < 26 && BASE58_REGEX.test(t)) return { name: "Bitcoin", shortName: "BTC", icon: "₿", type: "btc" };
  if (t.length < 32 && BASE58_REGEX.test(t) && !t.startsWith("0x") && !t.startsWith("bc1")) return { name: "Solana", shortName: "SOL", icon: "◎", type: "sol" };
  return null;
}

// ── Validation state ────────────────────────────────────────────────

export type ValidationState = "empty" | "typing" | "valid" | "invalid" | "mismatch";

export interface ValidationResult {
  state: ValidationState;
  detectedNetwork: DetectedNetwork | null;
}

function getValidationResult(address: string, expectedType: AddressNetworkType | null): ValidationResult {
  const trimmed = address.trim();
  if (!trimmed) return { state: "empty", detectedNetwork: null };

  const detected = detectNetwork(trimmed);
  if (detected) {
    // Cross-validate: if we know what network is expected, check for mismatch
    if (expectedType && expectedType !== "unknown" && detected.type !== expectedType) {
      return { state: "mismatch", detectedNetwork: detected };
    }
    return { state: "valid", detectedNetwork: detected };
  }

  // Partial match — user is still typing
  const partial = detectPartialNetwork(trimmed);
  if (partial) return { state: "typing", detectedNetwork: partial };

  return { state: "invalid", detectedNetwork: null };
}

// ── Helper: map currency ticker/network to expected address type ────

const EVM_TICKERS = new Set(["eth", "bnb", "matic", "avax", "usdt", "usdc", "dai", "wbtc", "link", "uni", "aave", "hype", "bera", "op", "arb", "ftm", "celo"]);
const EVM_NETWORKS = new Set(["eth", "bsc", "matic", "avax", "arb", "op", "base", "celo", "ftm", "one", "glmr", "movr"]);

export function tickerToAddressType(ticker?: string, network?: string): AddressNetworkType {
  const t = ticker?.toLowerCase() || "";
  const n = network?.toLowerCase() || "";
  if (t === "btc") return "btc";
  if (t === "sol" || n === "sol") return "sol";
  if (EVM_TICKERS.has(t) || EVM_NETWORKS.has(n)) return "evm";
  return "unknown";
}

export function addressTypeLabel(type: AddressNetworkType): string {
  switch (type) {
    case "evm": return "Ethereum / EVM";
    case "btc": return "Bitcoin";
    case "sol": return "Solana";
    default: return "this network";
  }
}

// ── Component ───────────────────────────────────────────────────────

interface DestinationAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
  /** Currency ticker for contextual placeholder */
  currencyTicker?: string;
  /** Expected address network type for cross-validation */
  expectedNetworkType?: AddressNetworkType;
  className?: string;
  /** Lock the input as read-only (ref-link hydration) */
  disabled?: boolean;
}

const DestinationAddressInput = ({
  value,
  onChange,
  onValidChange,
  currencyTicker,
  expectedNetworkType,
  className,
  disabled,
}: DestinationAddressInputProps) => {
  const [focused, setFocused] = useState(false);
  const [pasting, setPasting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValidRef = useRef<boolean | null>(null);

  const { state, detectedNetwork } = getValidationResult(value, expectedNetworkType ?? null);

  // Notify parent — only "valid" (and matching) counts
  useEffect(() => {
    const isValid = state === "valid";
    if (prevValidRef.current !== isValid) {
      prevValidRef.current = isValid;
      onValidChange?.(isValid);
    }
  }, [state, onValidChange]);

  const handlePaste = useCallback(async () => {
    try {
      setPasting(true);
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text.trim().slice(0, 128));
        inputRef.current?.focus();
      }
    } catch {
      // Clipboard permission denied
    } finally {
      setTimeout(() => setPasting(false), 300);
    }
  }, [onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.slice(0, 128));
  };

  // Visual states
  const isMismatch = state === "mismatch";
  const isInvalid = state === "invalid";
  const isValid = state === "valid";

  const borderClass =
    isMismatch
      ? "border-destructive ring-destructive/30"
      : isValid
        ? "border-trust ring-trust/30"
        : isInvalid
          ? "border-destructive ring-destructive/30"
          : focused
            ? "border-primary ring-primary/20"
            : "border-muted-foreground/40";

  const ringClass = focused || isValid || isInvalid || isMismatch ? "ring-2" : "";

  return (
    <div className={className}>
      <div
        className={`relative flex items-center gap-2 rounded-xl bg-accent px-4 py-3.5 transition-all duration-200 ${borderClass} ${ringClass} border`}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={
            currencyTicker
              ? `Paste your ${currencyTicker.toUpperCase()} destination address`
              : "Paste your destination address"
          }
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          readOnly={disabled}
          className={`flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
          maxLength={128}
        />

        {/* Badge */}
        <AnimatePresence mode="wait">
          {state === "typing" && detectedNetwork && (
            <motion.span
              key="typing-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-1"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-display text-[11px] font-semibold text-primary">
                {detectedNetwork.icon} {detectedNetwork.shortName}
              </span>
            </motion.span>
          )}
          {isValid && detectedNetwork && (
            <motion.span
              key="valid-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-trust/30 bg-trust/10 px-2 py-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-trust" />
              <span className="font-display text-[11px] font-semibold text-trust">
                {detectedNetwork.icon} {detectedNetwork.shortName}
              </span>
            </motion.span>
          )}
          {isMismatch && detectedNetwork && (
            <motion.span
              key="mismatch-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
              <span className="font-display text-[11px] font-semibold text-destructive">
                {detectedNetwork.icon} {detectedNetwork.shortName}
              </span>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Paste button */}
        <button
          type="button"
          onClick={handlePaste}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 font-body text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
          title="Paste from clipboard"
        >
          {pasting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Clipboard className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">Paste</span>
        </button>
      </div>

      {/* Status messages */}
      <AnimatePresence mode="wait">
        {isValid && detectedNetwork && (
          <motion.p
            key="valid-msg"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 flex items-center gap-1.5 font-body text-xs text-trust"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            ✓ This is a valid {detectedNetwork.name} address.
          </motion.p>
        )}
        {isMismatch && detectedNetwork && expectedNetworkType && (
          <motion.div
            key="mismatch-msg"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
          >
            <p className="flex items-start gap-2 font-body text-xs font-medium text-destructive">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Error:</strong> This is a {detectedNetwork.name} address. Please provide a valid{" "}
                <strong>{addressTypeLabel(expectedNetworkType)}</strong> address to avoid loss of funds.
              </span>
            </p>
          </motion.div>
        )}
        {isInvalid && (
          <motion.p
            key="invalid-msg"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 flex items-center gap-1.5 font-body text-xs text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Invalid address format for this network.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DestinationAddressInput;
