"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrderAction } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { selectSubtotal, useCartStore } from "@/store/cart-store";
import { useHydrated } from "@/store/use-hydrated";
import { formatPrice } from "@/lib/utils";

const FIELDS = [
  { name: "fullName", label: "Full name", required: true },
  { name: "phone", label: "Phone", required: true },
  { name: "line1", label: "Address line 1", required: true },
  { name: "line2", label: "Address line 2", required: false },
  { name: "city", label: "City", required: true },
  { name: "region", label: "Region / State", required: true },
  { name: "postalCode", label: "Postal code", required: false },
  { name: "country", label: "Country", required: true },
] as const;

export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const clear = useCartStore((s) => s.clear);
  const hydrated = useHydrated();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) return null;
  if (items.length === 0)
    return <p className="text-muted-foreground">Your cart is empty.</p>;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const val = (k: string) => {
      const v = String(fd.get(k) ?? "").trim();
      return v === "" ? undefined : v;
    };

    startTransition(async () => {
      const res = await createOrderAction({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shipping: {
          fullName: val("fullName"),
          phone: val("phone"),
          line1: val("line1"),
          line2: val("line2"),
          city: val("city"),
          region: val("region"),
          postalCode: val("postalCode"),
          country: val("country"),
        },
        notes: val("notes"),
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      clear();
      toast.success("Order placed");
      router.push(`/orders/${res.data.orderId}`);
    });
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <form onSubmit={onSubmit} className="space-y-4">
        {FIELDS.map((f) => (
          <div key={f.name} className="space-y-2">
            <Label htmlFor={f.name}>{f.label}</Label>
            <Input
              id={f.name}
              name={f.name}
              required={f.required}
              defaultValue={f.name === "fullName" ? defaultName : undefined}
            />
          </div>
        ))}
        <div className="space-y-2">
          <Label htmlFor="notes">Order notes</Label>
          <Textarea id="notes" name="notes" maxLength={500} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Placing order…" : "Place order"}
        </Button>
      </form>

      <aside className="h-fit space-y-3 border p-4">
        <h2 className="font-medium">Summary</h2>
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between text-sm">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{formatPrice(i.priceCents * i.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-3 text-sm font-medium">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Shipping and final total are confirmed by the server.
        </p>
      </aside>
    </div>
  );
}
