import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyKey } from "@/lib/labels";

interface UIState {
  bagOpen: boolean;
  setBagOpen: (open: boolean) => void;
  currency: CurrencyKey;
  setCurrency: (c: CurrencyKey) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      bagOpen: false,
      setBagOpen: (bagOpen) => set({ bagOpen }),
      currency: "USD",
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "loki-ui", partialize: (s) => ({ currency: s.currency }) },
  ),
);