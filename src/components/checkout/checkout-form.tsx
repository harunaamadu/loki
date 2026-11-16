"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrderAction } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/shared/money";
import { selectBagSubtotal, useBagStore } from "@/store/bag-store";
import { useUIStore } from "@/store/ui-store";
import { computePricing } from "@/lib/pricing";
import {
  CURRENCIES,
  DELIVERY_LABEL,
  DELIVERY_METHODS,
  PAYMENT_LABEL,
  PAYMENT_METHODS,
  type CurrencyKey,
  type DeliveryKey,
  type PaymentKey,
} from "@/lib/labels";

interface Defaults {
  name: string;
  phone: string;
  city: string;
  country: string;
  street: string;
}

const isMomo = (m: PaymentKey) =>
  m === "MTN_MOBILE_MONEY" || m === "TELECEL_CASH";

export function CheckoutForm({ defaults }: { defaults: Defaults }) {
  const router = useRouter();
  const items = useBagStore((s) => s.items);
  const subtotal = useBagStore(selectBagSubtotal);
  const storeCurrency = useUIStore((s) => s.currency);
  const [pending, start] = useTransition();
  const [country, setCountry] = useState(defaults.country);
  const [delivery, setDelivery] = useState<DeliveryKey>("DHL_EXPRESS_DDP");
  const [payment, setPayment] = useState<PaymentKey>("CARD");
  const [currency, setCurrency] = useState<CurrencyKey>(storeCurrency);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0)
    return <p className="text-muted-foreground">Your bag is empty.</p>;

  const est = computePricing({
    subtotalUsdCents: subtotal,
    discountUsdCents: 0,
    deliveryMethod: delivery,
    country,
  });

  function choosePayment(m: PaymentKey) {
    setPayment(m);
    if (isMomo(m)) setCurrency("GHS"); // mobile money is charged in GHS
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const s = (k: string) => String(fd.get(k) ?? "").trim();

    start(async () => {
      const res = await createOrderAction({
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          quantity: i.quantity,
        })),
        customerName: s("customerName"),
        phone: s("phone"),
        shippingCity: s("shippingCity"),
        shippingCountry: country.trim(),
        shippingAddress: s("shippingAddress"),
        deliveryMethod: delivery,
        paymentMethod: payment,
        currency,
        promoCode: s("promoCode") || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      useBagStore.getState().setItems([]); // the server already emptied the bag
      if (res.data.paymentUrl) {
        window.location.assign(res.data.paymentUrl);
      } else {
        toast.message("Order created. Complete payment from your order page.");
        router.push(`/orders/${res.data.orderId}`);
      }
    });
  }

  const field = (name: string, label: string, def = "", type = "text") => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={def} required />
    </div>
  );

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_340px]">
      <form onSubmit={onSubmit} className="space-y-4">
        {field("customerName", "Full name", defaults.name)}
        {field("phone", "Phone", defaults.phone, "tel")}
        {field("shippingAddress", "Street address", defaults.street)}
        {field("shippingCity", "City", defaults.city)}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Delivery</Label>
          {DELIVERY_METHODS.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={delivery === m}
                onChange={() => setDelivery(m)}
              />
              {DELIVERY_LABEL[m]}
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment">Payment method</Label>
          <select
            id="payment"
            value={payment}
            onChange={(e) => choosePayment(e.target.value as PaymentKey)}
            className="h-9 w-full border bg-background px-3 text-sm"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_LABEL[m]}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            You&apos;ll complete payment securely on Paystack.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Charge currency</Label>
          <select
            id="currency"
            value={currency}
            disabled={isMomo(payment)}
            onChange={(e) => setCurrency(e.target.value as CurrencyKey)}
            className="h-9 w-full border bg-background px-3 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="promoCode">Promo code</Label>
          <Input id="promoCode" name="promoCode" maxLength={32} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Placing order…" : "Place order and pay"}
        </Button>
      </form>

      <aside className="h-fit space-y-2 border p-4 text-sm">
        <h2 className="font-medium">Order summary</h2>
        {items.map((i) => (
          <div
            key={`${i.productId}-${i.size}`}
            className="flex justify-between"
          >
            <span>
              {i.title} ({i.size}) × {i.quantity}
            </span>
            <Price usdCents={i.priceUsdCents * i.quantity} />
          </div>
        ))}
        <div className="flex justify-between border-t pt-2">
          <span>Subtotal</span>
          <Price usdCents={subtotal} />
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <Price usdCents={est.shippingUsdCents} />
        </div>
        <div className="flex justify-between">
          <span>Duties &amp; taxes</span>
          <Price usdCents={est.dutiesUsdCents} />
        </div>
        <div className="flex justify-between border-t pt-2 font-medium">
          <span>Estimated total</span>
          <Price usdCents={est.totalUsdCents} />
        </div>
        <p className="text-xs text-muted-foreground">
          Promo discounts and the final total are confirmed by the server before
          payment.
        </p>
      </aside>
    </div>
  );
}
