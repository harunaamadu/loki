"use client";

import Link from "next/link";
import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Price } from "@/components/shared/money";
import { setBagQuantityAction } from "@/actions/bag";
import {
  applyBagResult,
  selectBagCount,
  selectBagSubtotal,
  useBagStore,
} from "@/store/bag-store";
import { useUIStore } from "@/store/ui-store";
import type { BagLine } from "@/lib/types";

export function BagButton() {
  const count = useBagStore(selectBagCount);
  const setBagOpen = useUIStore((s) => s.setBagOpen);
  return (
    <Button variant="outline" size="sm" onClick={() => setBagOpen(true)}>
      Bag ({count})
    </Button>
  );
}

export function BagDrawer() {
  const open = useUIStore((s) => s.bagOpen);
  const setOpen = useUIStore((s) => s.setBagOpen);
  const items = useBagStore((s) => s.items);
  const subtotal = useBagStore(selectBagSubtotal);
  const [busy, setBusy] = useState(false);

  async function change(line: BagLine, quantity: number) {
    setBusy(true);
    applyBagResult(
      await setBagQuantityAction({
        productId: line.productId,
        size: line.size,
        quantity,
      }),
    );
    setBusy(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Shopping bag</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          )}
          {items.map((l) => (
            <div
              key={`${l.productId}-${l.size}`}
              className="flex gap-3 border-b pb-4"
            >
              <div className="h-24 w-20 shrink-0 bg-muted">
                {l.imagePublicId && (
                  <CldImage
                    src={l.imagePublicId}
                    width={160}
                    height={192}
                    crop="fill"
                    gravity="auto"
                    alt={l.title}
                    className="h-24 w-20 object-cover"
                  />
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="text-xs uppercase text-muted-foreground">
                  {l.designer}
                </p>
                <Link
                  href={`/product/${l.productId}`}
                  onClick={() => setOpen(false)}
                  className="font-medium"
                >
                  {l.title}
                </Link>
                <p className="text-muted-foreground">Size {l.size}</p>
                <Price usdCents={l.priceUsdCents} />
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => change(l, l.quantity - 1)}
                  >
                    −
                  </Button>
                  <span className="w-6 text-center">{l.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || l.quantity >= Math.min(10, l.stock)}
                    onClick={() => change(l, l.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => change(l, 0)}
                  >
                    Remove
                  </Button>
                </div>
                {l.stock < l.quantity && (
                  <p className="mt-1 text-xs text-destructive">
                    Only {l.stock} left in this size.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="border-t">
          <div className="flex w-full justify-between text-sm">
            <span>Subtotal</span>
            <Price usdCents={subtotal} className="font-medium" />
          </div>
          <p className="text-xs text-muted-foreground">
            Shipping and duties are calculated at checkout.
          </p>
          <Button asChild disabled={items.length === 0} className="w-full">
            <Link href="/checkout" onClick={() => setOpen(false)}>
              Checkout
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
