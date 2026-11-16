import { useEffect, useState } from "react";

/** Avoids SSR/client mismatches for persisted stores. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
