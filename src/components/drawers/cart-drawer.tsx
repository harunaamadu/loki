"use client";

import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { selectSubtotal, useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useHydrated } from "@/store/use-hydrated";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen);
  const setOpen = useUIStore((s) => s.setCartOpen);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const hydrated = useHydrated();

  const list = hydrated ? items : [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          )}
          {list.map((item) => (
            <div key={item.productId} className="flex gap-3 border-b pb-4">
              <div className="h-20 w-20 shrink-0 bg-muted">
                {item.image && (
                  <CldImage
                    src={item.image}
                    width={160}
                    height={160}
                    crop="fill"
                    gravity="auto"
                    alt={item.name}
                    className="h-20 w-20 object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(item.priceCents)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    −
                  </Button>
                  <span className="w-6 text-center text-sm">
                    {item.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={item.quantity >= item.stock}
                    onClick={() =>
                      setQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(item.productId)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="border-t">
          <div className="flex w-full items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-medium">
              {formatPrice(hydrated ? subtotal : 0)}
            </span>
          </div>
          <Button asChild disabled={list.length === 0} className="w-full">
            <Link href="/checkout" onClick={() => setOpen(false)}>
              Checkout
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
