"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";

export function AddToCartButton({
  item,
}: {
  item: Omit<CartItem, "quantity">;
}) {
  const add = useCartStore((s) => s.add);
  const setBagOpen = useUIStore((s) => s.setBagOpen);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const soldOut = item.stock <= 0;

  function handleClick() {
    if (loading || soldOut) return;
    setLoading(true);
    timer.current = setTimeout(() => {
      add(item);
      toast.success(`${item.name} added to cart`);
      setBagOpen(true);
      setLoading(false);
    }, 600);
  }

  return (
    <Button
      className="w-full"
      disabled={soldOut || loading}
      aria-busy={loading}
      onClick={handleClick}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding…
        </>
      ) : soldOut ? (
        "Sold out"
      ) : (
        "Add to bag"
      )}
    </Button>
  );
}
