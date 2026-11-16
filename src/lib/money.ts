import type { CurrencyKey } from "@/lib/labels";

export const USD_TO_GHS = Number(process.env.NEXT_PUBLIC_USD_TO_GHS ?? "15");

/** Pass `rate` (Order.fxRate) to display a past order at the rate it was charged. */
export function formatMoney(
  usdCents: number,
  currency: CurrencyKey = "USD",
  rate: number = USD_TO_GHS,
) {
  const amount = (usdCents / 100) * (currency === "GHS" ? rate : 1);
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
