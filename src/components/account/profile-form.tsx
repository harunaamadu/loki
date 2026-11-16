"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUIStore } from "@/store/ui-store";
import { CURRENCIES, type CurrencyKey } from "@/lib/labels";

interface Props {
  initial: {
    name: string;
    phone: string;
    city: string;
    country: string;
    streetAddress: string;
    currency: CurrencyKey;
  };
}

export function ProfileForm({ initial }: Props) {
  const [pending, start] = useTransition();
  const setCurrency = useUIStore((s) => s.setCurrency);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = (k: string) => String(fd.get(k) ?? "").trim();
    const nullable = (k: string) => s(k) || null;
    const currency = s("currency") as CurrencyKey;

    start(async () => {
      const res = await updateProfileAction({
        displayName: s("displayName"),
        phone: nullable("phone"),
        city: nullable("city"),
        country: nullable("country"),
        streetAddress: nullable("streetAddress"),
        currency,
      });
      if (res.ok) {
        setCurrency(currency);
        toast.success("Profile saved");
      } else toast.error(res.error);
    });
  }

  const field = (name: string, label: string, def: string) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={def} />
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      {field("displayName", "Name", initial.name)}
      {field("phone", "Phone", initial.phone)}
      {field("streetAddress", "Street address", initial.streetAddress)}
      {field("city", "City", initial.city)}
      {field("country", "Country", initial.country)}
      <div className="space-y-2">
        <Label htmlFor="currency">Preferred currency</Label>
        <select
          id="currency"
          name="currency"
          defaultValue={initial.currency}
          className="h-9 w-full border bg-background px-3 text-sm"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        Save
      </Button>
    </form>
  );
}
