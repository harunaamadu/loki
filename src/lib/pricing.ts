import type { DeliveryKey } from "@/lib/labels";
import { FREE_SHIPPING_THRESHOLD_USD_CENTS } from "@/config/store";

// ⚠️ PLACEHOLDER VALUES. Replace with the rates from your Vite checkout.
export const SHIPPING_USD_CENTS: Record<DeliveryKey, number> = {
  DHL_EXPRESS_DDP: 4500,
  ATELIER_PRIORITY_COURIER: 9500,
};
const GHANA_DUTIES_RATE = 0.2;

export function isGhana(country: string) {
  return ["ghana", "gh"].includes(country.trim().toLowerCase());
}

export function computePricing(input: {
  subtotalUsdCents: number;
  discountUsdCents: number;
  deliveryMethod: DeliveryKey;
  country: string;
}) {
  const taxable = Math.max(0, input.subtotalUsdCents - input.discountUsdCents);

  // "Complimentary DHL Express DDP … over $500" (from the promo banner).
  // Assumption: measured on the subtotal BEFORE discounts. To measure after discounts, use `taxable`.
  const freeShipping =
    input.deliveryMethod === "DHL_EXPRESS_DDP" && input.subtotalUsdCents >= FREE_SHIPPING_THRESHOLD_USD_CENTS;

  const shippingUsdCents = freeShipping ? 0 : SHIPPING_USD_CENTS[input.deliveryMethod];
  const dutiesUsdCents = isGhana(input.country) ? Math.round(taxable * GHANA_DUTIES_RATE) : 0;

  return {
    shippingUsdCents,
    dutiesUsdCents,
    totalUsdCents: taxable + shippingUsdCents + dutiesUsdCents,
  };
}