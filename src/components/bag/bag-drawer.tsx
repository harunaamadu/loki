"use client";

import Link from "next/link";
import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Price } from "@/components/shared/money";
import {
  addToBagAction,
  removeBagItemsAction,
  setBagQuantityAction,
} from "@/actions/bag";
import {
  applyBagResult,
  selectBagCount,
  selectBagSubtotal,
  useBagStore,
} from "@/store/bag-store";
import { useUIStore } from "@/store/ui-store";
import type { BagLine } from "@/lib/types";
import { useHydrated } from "@/hooks/use-hydrated";
import { ShoppingBag } from "lucide-react";
import { Badge } from "../ui/badge";

const lineKey = (l: Pick<BagLine, "productId" | "size">) =>
  `${l.productId}::${l.size}`;

function stockNote(l: BagLine) {
  if (l.stock <= 0) return "Sold out in this size. Remove it to continue.";
  if (l.stock < l.quantity) return `Only ${l.stock} left in this size.`;
  return null;
}

/** Module-level so Undo still works after the drawer has been closed. */
async function restoreLines(lines: BagLine[]) {
  let restored = 0;
  for (const l of lines) {
    const ok = applyBagResult(
      await addToBagAction({
        productId: l.productId,
        size: l.size,
        quantity: l.quantity,
      }),
    );
    if (ok) restored++;
  }
  if (restored > 0)
    toast.success(
      restored === 1 ? "Item restored" : `${restored} items restored`,
    );
}

export function BagButton() {
  const count = useBagStore(selectBagCount);
  const hydrated = useHydrated();
  const setBagOpen = useUIStore((s) => s.setBagOpen);
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setBagOpen(true)}
      className="relative"
    >
      <ShoppingBag />
      <Badge className="absolute -top-2 -right-2 text-[10px]">
        {hydrated ? count : 0}
      </Badge>
    </Button>
  );
}

// Lives inside SheetContent, so it unmounts when the drawer closes and the selection resets.
function BagPanel() {
  const items = useBagStore((s) => s.items);
  const subtotal = useBagStore(selectBagSubtotal);
  const setOpen = useUIStore((s) => s.setBagOpen);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  // Derived from the live bag, so a stale key can never inflate the count
  const selectedLines = items.filter((l) => selected.has(lineKey(l)));
  const allSelected = items.length > 0 && selectedLines.length === items.length;
  const blocked = items.some((l) => l.stock < l.quantity);

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

  function toggle(line: BagLine, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(lineKey(line));
      else next.delete(lineKey(line));
      return next;
    });
  }

  function toggleAll(on: boolean) {
    setSelected(on ? new Set(items.map(lineKey)) : new Set());
  }

  async function removeSelected() {
    const lines = selectedLines;
    if (lines.length === 0) return;

    setBusy(true);
    const ok = applyBagResult(
      await removeBagItemsAction(
        lines.map(({ productId, size }) => ({ productId, size })),
      ),
    );
    setBusy(false);
    if (!ok) return;

    setSelected(new Set());
    toast.success(
      lines.length === 1 ? "Item removed" : `${lines.length} items removed`,
      {
        action: { label: "Undo", onClick: () => void restoreLines(lines) },
      },
    );
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-xl">Shopping bag</SheetTitle>
      </SheetHeader>

      <div className="flex-1 space-y-4 overflow-y-auto px-4">
        {items.length === 0 && (
          <div className="space-y-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/shop" onClick={() => setOpen(false)}>
                Continue shopping
              </Link>
            </Button>
          </div>
        )}

        {items.length > 1 && (
          <div className="flex items-center gap-2 border-b pb-3">
            <Checkbox
              id="bag-select-all"
              checked={
                allSelected
                  ? true
                  : selectedLines.length > 0
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={(v) => toggleAll(v === true)}
            />
            <Label
              htmlFor="bag-select-all"
              className="text-xs font-normal text-muted-foreground"
            >
              {selectedLines.length > 0
                ? `${selectedLines.length} of ${items.length} selected`
                : "Select all"}
            </Label>
          </div>
        )}

        {items.map((l) => {
          const note = stockNote(l);
          return (
            <div key={lineKey(l)} className="flex gap-3 border-b pb-4">
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

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label="Decrease quantity"
                      disabled={busy}
                      onClick={() => change(l, l.quantity - 1)}
                    >
                      −
                    </Button>
                    <span className="w-6 text-center" aria-live="polite">
                      {l.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label="Increase quantity"
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
                  <Checkbox
                    className="shrink-0"
                    aria-label={`Select ${l.title}, size ${l.size}`}
                    checked={selected.has(lineKey(l))}
                    onCheckedChange={(v) => toggle(l, v === true)}
                  />
                </div>

                {note && (
                  <p className="mt-1 text-xs text-destructive">{note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <SheetFooter className="border-t">
        <div className="flex w-full justify-between text-sm">
          <span>Subtotal</span>
          <Price usdCents={subtotal} className="font-medium" />
        </div>
        <p className="text-xs text-muted-foreground">
          Shipping and duties are calculated at checkout.
        </p>
        {blocked && (
          <p className="text-xs text-destructive">
            Update the items marked above to continue to checkout.
          </p>
        )}

        {items.length === 0 || blocked ? (
          <Button disabled className="w-full">
            Checkout
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link href="/checkout" onClick={() => setOpen(false)}>
              Checkout
            </Link>
          </Button>
        )}

        {selectedLines.length > 0 && (
          <Button
            variant="destructive"
            className="w-full"
            disabled={busy}
            onClick={removeSelected}
          >
            Remove selected ({selectedLines.length})
          </Button>
        )}
      </SheetFooter>
    </>
  );
}

export function BagDrawer() {
  const open = useUIStore((s) => s.bagOpen);
  const setOpen = useUIStore((s) => s.setBagOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <BagPanel />
      </SheetContent>
    </Sheet>
  );
}
