import { create } from "zustand";

interface UIState {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  cartOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
}));
