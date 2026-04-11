import { useSyncExternalStore } from "react";

export interface ExchangeSyncOption {
  ticker: string;
  label: string;
}

type ExchangeSubmitHandler = (() => void) | null;

interface ExchangeSyncState {
  fromTicker: string;
  toTicker: string;
  options: ExchangeSyncOption[];
  isReady: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitHandler: ExchangeSubmitHandler;
}

const listeners = new Set<() => void>();

let state: ExchangeSyncState = {
  fromTicker: "",
  toTicker: "",
  options: [],
  isReady: false,
  canSubmit: false,
  isSubmitting: false,
  submitHandler: null,
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

const emit = () => {
  listeners.forEach((listener) => listener());
};

const updateState = (patch: Partial<ExchangeSyncState>) => {
  // Skip equality check for function values (they're new every render)
  const hasChanged = Object.entries(patch).some(([key, value]) => {
    if (typeof value === "function") return false;
    return state[key as keyof ExchangeSyncState] !== value;
  });
  if (!hasChanged && !("submitHandler" in patch)) return;
  state = { ...state, ...patch };
  // Don't notify listeners for submitHandler-only updates to avoid infinite loops
  if ("submitHandler" in patch && Object.keys(patch).length === 1) {
    return;
  }
  emit();
};

const actions = {
  setFromTicker: (ticker: string) => updateState({ fromTicker: ticker.toLowerCase() }),
  setToTicker: (ticker: string) => updateState({ toTicker: ticker.toLowerCase() }),
  setOptions: (options: ExchangeSyncOption[]) => updateState({ options }),
  setReady: (isReady: boolean) => updateState({ isReady }),
  setCanSubmit: (canSubmit: boolean) => updateState({ canSubmit }),
  registerSubmitHandler: (submitHandler: ExchangeSubmitHandler) => updateState({ submitHandler }),
  resetSubmitting: () => updateState({ isSubmitting: false }),
  requestSubmit: () => {
    if (!state.submitHandler || !state.canSubmit || state.isSubmitting) return false;
    updateState({ isSubmitting: true });
    state.submitHandler();
    return true;
  },
};

export function useExchangeSync() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...snapshot,
    ...actions,
  };
}
