import { create } from "zustand";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action";
import type { BagLine } from "@/lib/types";

interface BagState {
  items: BagLine[];
  setItems: (items: BagLine[]) => void;
}

// The server (Postgres) is the source of truth; this store mirrors it for instant UI.
export const useBagStore = create<BagState>()((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export const selectBagCount = (s: BagState) =>
  s.items.reduce((n, i) => n + i.quantity, 0);
export const selectBagSubtotal = (s: BagState) =>
  s.items.reduce((n, i) => n + i.priceUsdCents * i.quantity, 0);

export function applyBagResult(res: ActionResult<BagLine[]>) {
  if (res.ok) {
    useBagStore.getState().setItems(res.data);
    return true;
  }
  toast.error(res.error);
  return false;
}
