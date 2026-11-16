"use client";

import { formatMoney } from "@/lib/money";
import { CURRENCIES, type CurrencyKey } from "@/lib/labels";
import { useUIStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";

export function Price({
  usdCents,
  className,
}: {
  usdCents: number;
  className?: string;
}) {
  const currency = useUIStore((s) => s.currency);
  const hydrated = useHydrated();
  return (
    <span className={className}>
      {formatMoney(usdCents, hydrated ? currency : "USD")}
    </span>
  );
}

export function CurrencyToggle() {
  const currency = useUIStore((s) => s.currency);
  const setCurrency = useUIStore((s) => s.setCurrency);
  const hydrated = useHydrated();
  return (
    <select
      aria-label="Currency"
      value={hydrated ? currency : "USD"}
      onChange={(e) => setCurrency(e.target.value as CurrencyKey)}
      className="h-8 border bg-background px-2 text-xs"
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
