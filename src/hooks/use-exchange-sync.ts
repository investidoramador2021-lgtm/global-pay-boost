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
  const hasChanged = Object.entries(patch).some(([key, value]) => state[key as keyof ExchangeSyncState] !== value);
  if (!hasChanged) return;
  state = { ...state, ...patch };
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
