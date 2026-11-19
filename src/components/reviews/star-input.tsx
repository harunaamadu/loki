"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { RATING_LABEL } from "@/lib/reviews";
import { cn } from "@/lib/utils";

// Native radio inputs, so arrow keys and screen readers work without extra code
export function StarInput({
  value,
  onChange,
  invalid,
}: {
  value: number;
  onChange: (n: number) => void;
  invalid?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset aria-invalid={invalid || undefined}>
      <legend className="sr-only">Your rating</legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="cursor-pointer p-0.5"
            onMouseEnter={() => setHover(n)}
          >
            <input
              type="radio"
              name="rating"
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <Star
              aria-hidden
              className={cn(
                "h-7 w-7 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground",
                n <= shown
                  ? "fill-foreground text-foreground"
                  : "text-muted-foreground/40",
              )}
            />
            <span className="sr-only">
              {n} {n === 1 ? "star" : "stars"}, {RATING_LABEL[n]}
            </span>
          </label>
        ))}
        <span className="ml-2 text-xs text-muted-foreground" aria-live="polite">
          {shown ? RATING_LABEL[shown] : ""}
        </span>
      </div>
    </fieldset>
  );
}
