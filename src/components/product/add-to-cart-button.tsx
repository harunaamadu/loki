"use client";

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

  return (
    <Button
      className="w-full"
      disabled={item.stock <= 0}
      onClick={() => {
        add(item);
        toast.success(`${item.name} added to cart`);
        setBagOpen(true);
      }}
    >
      {item.stock <= 0 ? "Sold out" : "Add to cart"}
    </Button>
  );
}
