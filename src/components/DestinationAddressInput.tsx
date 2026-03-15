import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Clipboard, Loader2 } from "lucide-react";

// ── Address validation ──────────────────────────────────────────────

interface DetectedNetwork {
  name: string;
  shortName: string;
  /** emoji or unicode icon */
  icon: string;
}

const BASE58_REGEX = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

function detectNetwork(address: string): DetectedNetwork | null {
  const trimmed = address.trim();
  if (!trimmed) return null;

  // Ethereum / EVM — 0x prefix, 42 hex chars
  if (/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
    return { name: "Ethereum / EVM", shortName: "ETH", icon: "⟠" };
  }

  // Bitcoin — Legacy (1…), P2SH (3…), Bech32 (bc1…)
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) {
    return { name: "Bitcoin (Legacy)", shortName: "BTC", icon: "₿" };
  }
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) {
    return { name: "Bitcoin (P2SH)", shortName: "BTC", icon: "₿" };
  }
  if (/^bc1[a-zA-HJ-NP-Z0-9]{25,90}$/.test(trimmed)) {
    return { name: "Bitcoin (Bech32)", shortName: "BTC", icon: "₿" };
  }

  // Solana — Base58, 32-44 chars, no 0x prefix
  if (trimmed.length >= 32 && trimmed.length <= 44 && BASE58_REGEX.test(trimmed)) {
    return { name: "Solana", shortName: "SOL", icon: "◎" };
  }

  // Hyperliquid (HYPE) — uses 0x addresses identical to EVM
  // (already matched above as EVM — kept separate if the user specifically uses a HYPE network context)

  return null;
}

type ValidationState = "empty" | "typing" | "valid" | "invalid";

function getValidationState(address: string): { state: ValidationState; network: DetectedNetwork | null } {
  const trimmed = address.trim();
  if (!trimmed) return { state: "empty", network: null };

  const network = detectNetwork(trimmed);
  if (network) return { state: "valid", network };

  // Partial match heuristics — user is still typing
  if (trimmed.startsWith("0x") && trimmed.length < 42) return { state: "typing", network: { name: "Ethereum / EVM", shortName: "ETH", icon: "⟠" } };
  if (trimmed.startsWith("bc1") && trimmed.length < 26) return { state: "typing", network: { name: "Bitcoin (Bech32)", shortName: "BTC", icon: "₿" } };
  if ((trimmed.startsWith("1") || trimmed.startsWith("3")) && trimmed.length < 26 && BASE58_REGEX.test(trimmed)) return { state: "typing", network: { name: "Bitcoin", shortName: "BTC", icon: "₿" } };
  if (trimmed.length < 32 && BASE58_REGEX.test(trimmed) && !trimmed.startsWith("0x")) return { state: "typing", network: { name: "Solana", shortName: "SOL", icon: "◎" } };

  return { state: "invalid", network: null };
}

// ── Component ───────────────────────────────────────────────────────

interface DestinationAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
  /** Currency ticker for contextual placeholder */
  currencyTicker?: string;
  className?: string;
}

const DestinationAddressInput = ({
  value,
  onChange,
  onValidChange,
  currencyTicker,
  className,
}: DestinationAddressInputProps) => {
  const [focused, setFocused] = useState(false);
  const [pasting, setPasting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValidRef = useRef<boolean | null>(null);

  const { state, network } = getValidationState(value);

  // Notify parent of validity changes
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
        // Sanitize: only allow alphanumeric + expected address chars, max 128 chars
        const sanitized = text.trim().slice(0, 128).replace(/[^a-zA-Z0-9]/g, "");
        // Re-add 0x prefix if it was stripped (hex addresses)
        const cleaned = text.trim().slice(0, 128);
        onChange(cleaned);
        inputRef.current?.focus();
      }
    } catch {
      // Clipboard permission denied — silently ignore
    } finally {
      setTimeout(() => setPasting(false), 300);
    }
  }, [onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit length and strip dangerous characters
    const raw = e.target.value.slice(0, 128);
    onChange(raw);
  };

  // Border / ring color based on state
  const borderClass =
    state === "valid"
      ? "border-trust ring-trust/30"
      : state === "invalid"
        ? "border-destructive ring-destructive/30"
        : focused
          ? "border-primary ring-primary/20"
          : "border-border";

  const ringClass = focused || state === "valid" || state === "invalid" ? "ring-2" : "";

  return (
    <div className={className}>
      {/* Input container */}
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
          className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
          maxLength={128}
        />

        {/* Network detected badge — pulsing while typing */}
        <AnimatePresence mode="wait">
          {state === "typing" && network && (
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
                {network.icon} {network.shortName}
              </span>
            </motion.span>
          )}
          {state === "valid" && network && (
            <motion.span
              key="valid-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-trust/30 bg-trust/10 px-2 py-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-trust" />
              <span className="font-display text-[11px] font-semibold text-trust">
                {network.icon} {network.shortName}
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

      {/* Status message */}
      <AnimatePresence mode="wait">
        {state === "valid" && network && (
          <motion.p
            key="valid-msg"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 flex items-center gap-1.5 font-body text-xs text-trust"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            This is a valid {network.name} address.
          </motion.p>
        )}
        {state === "invalid" && (
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
