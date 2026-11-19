"use client";

import { formatMoney } from "@/lib/money";
import { CURRENCIES, type CurrencyKey } from "@/lib/labels";
import { useUIStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Select
      value={hydrated ? currency : "USD"}
      onValueChange={(value) => setCurrency(value as CurrencyKey)}
    >
      <SelectTrigger aria-label="Currency" className="h-9 w-fit text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Currencies</SelectLabel>
          {CURRENCIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}