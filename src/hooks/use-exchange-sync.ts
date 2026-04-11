import { useSyncExternalStore, useCallback } from "react";

export interface ExchangeSyncOption {
  ticker: string;
  label: string;
}

type ExchangeSubmitHandler = (() => void) | null;

/* ── Reactive state (drives re-renders via useSyncExternalStore) ── */
interface ExchangeSyncSnapshot {
  fromTicker: string;
  toTicker: string;
  options: ExchangeSyncOption[];
  isReady: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
}

const listeners = new Set<() => void>();

let snapshot: ExchangeSyncSnapshot = {
  fromTicker: "",
  toTicker: "",
  options: [],
  isReady: false,
  canSubmit: false,
  isSubmitting: false,
};

/* ── Non-reactive ref (never triggers re-render) ── */
let _submitHandler: ExchangeSubmitHandler = null;

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => snapshot;

const emit = () => listeners.forEach((l) => l());

const updateSnapshot = (patch: Partial<ExchangeSyncSnapshot>) => {
  const changed = Object.entries(patch).some(
    ([k, v]) => snapshot[k as keyof ExchangeSyncSnapshot] !== v,
  );
  if (!changed) return;
  snapshot = { ...snapshot, ...patch };
  emit();
};

const actions = {
  setFromTicker: (t: string) => updateSnapshot({ fromTicker: t.toLowerCase() }),
  setToTicker: (t: string) => updateSnapshot({ toTicker: t.toLowerCase() }),
  setOptions: (o: ExchangeSyncOption[]) => updateSnapshot({ options: o }),
  setReady: (r: boolean) => updateSnapshot({ isReady: r }),
  setCanSubmit: (c: boolean) => updateSnapshot({ canSubmit: c }),
  /** Store the handler WITHOUT emitting — avoids infinite re-render loop */
  registerSubmitHandler: (h: ExchangeSubmitHandler) => {
    _submitHandler = h;
  },
  resetSubmitting: () => updateSnapshot({ isSubmitting: false }),
  requestSubmit: () => {
    if (!_submitHandler || !snapshot.canSubmit || snapshot.isSubmitting) return false;
    updateSnapshot({ isSubmitting: true });
    _submitHandler();
    return true;
  },
};

export function useExchangeSync() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...snap, ...actions };
}
