"use client";

import { Button } from "@/components/ui/button";
import { selectCount, useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useHydrated } from "@/store/use-hydrated";

export function CartButton() {
  const count = useCartStore(selectCount);
  const hydrated = useHydrated();
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  return (
    <Button variant="outline" size="sm" onClick={() => setCartOpen(true)}>
      Cart ({hydrated ? count : 0})
    </Button>
  );
}
