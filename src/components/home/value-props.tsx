import { FREE_SHIPPING_THRESHOLD_USD_CENTS } from "@/config/store";

const threshold = `$${(FREE_SHIPPING_THRESHOLD_USD_CENTS / 100).toLocaleString("en")}`;

const ITEMS = [
  [
    "Delivered duty paid",
    "Import duties and taxes are calculated at checkout, so there's nothing to pay on arrival.",
  ],
  [
    "Independent boutiques",
    "Every piece is sourced from independent luxury boutiques in Europe and North America.",
  ],
  [
    "Complimentary shipping",
    `DHL Express DDP is free on orders over ${threshold}.`,
  ],
] as const;

export function ValueProps() {
  return (
    <section
      aria-label="Why Loki"
      className="grid gap-8 border-y py-10 md:grid-cols-3"
    >
      {ITEMS.map(([title, body]) => (
        <div key={title} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em]">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>
      ))}
    </section>
  );
}
