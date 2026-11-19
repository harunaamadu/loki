"use client";

import { Button } from "@/components/ui/button";
import { selectCount, useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { ShoppingBag } from "lucide-react";

export function BagButton() {
  const count = useCartStore(selectCount);
  const hydrated = useHydrated();
  const setBagOpen = useUIStore((s) => s.setBagOpen);

  return (
    <Button
      variant="outline"
      size="icon"
      className=""
      onClick={() => setBagOpen(true)}
    >
      <ShoppingBag /> ({hydrated ? count : 0})
    </Button>
  );
}
