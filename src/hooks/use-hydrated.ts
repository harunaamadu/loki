import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Avoids SSR/client mismatches for persisted stores. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
