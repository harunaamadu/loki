export interface PromoRule {
  percentOff: number | null;
  amountOffUsdCents: number | null;
  minSubtotalUsdCents: number;
}

export type PromoResult =
  | { ok: true; discountUsdCents: number }
  | { ok: false; minSubtotalUsdCents: number };

/** Discount is never larger than the subtotal. Percentages round to the nearest cent. */
export function promoDiscount(
  promo: PromoRule,
  subtotalUsdCents: number,
): PromoResult {
  if (subtotalUsdCents < promo.minSubtotalUsdCents) {
    return { ok: false, minSubtotalUsdCents: promo.minSubtotalUsdCents };
  }
  const raw =
    promo.percentOff !== null
      ? Math.round((subtotalUsdCents * promo.percentOff) / 100)
      : (promo.amountOffUsdCents ?? 0);
  return {
    ok: true,
    discountUsdCents: Math.min(subtotalUsdCents, Math.max(0, raw)),
  };
}
