"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  FREE_SHIPPING_THRESHOLD_USD_CENTS,
  PROMO_COOKIE,
} from "@/config/store";

const threshold = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format(FREE_SHIPPING_THRESHOLD_USD_CENTS / 100);

export function PromoBanner({
  initiallyDismissed,
}: {
  initiallyDismissed: boolean;
}) {
  const [dismissed, setDismissed] = useState(initiallyDismissed);
  if (dismissed) return null;

  function dismiss() {
    document.cookie = `${PROMO_COOKIE}=1; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax`;
    setDismissed(true);
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-primary px-4 py-2 text-xs text-primary-foreground sm:px-8">
      <p className="mx-auto truncate text-center tracking-wide">
        Complimentary DHL Express DDP to Ghana &amp; Worldwide over {threshold}{" "}
        · Use code <span className="font-semibold">LOKI10</span> for 10% off
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss shipping announcement"
        className="shrink-0 cursor-pointer p-0.5 text-primary-foreground/60 transition-colors hover:text-primary-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
