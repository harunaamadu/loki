import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const stars = (cls: string) =>
  [1, 2, 3, 4, 5].map((n) => (
    <Star key={n} aria-hidden className={cn("shrink-0 fill-current", cls)} />
  ));

/** Read-only, supports fractions (4.5 fills half of the fifth star). */
export function StarRating({
  value,
  className,
  starClassName = "h-4 w-4",
}: {
  value: number;
  className?: string;
  starClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      className={cn("relative inline-flex", className)}
    >
      <span className="flex text-muted-foreground/30">
        {stars(starClassName)}
      </span>
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        <span className="flex w-max text-foreground">
          {stars(starClassName)}
        </span>
      </span>
    </span>
  );
}
