import { StarRating } from "@/components/reviews/star-rating";
import type { ReviewSummaryData } from "@/lib/reviews";

export function ReviewSummaryCard({ summary }: { summary: ReviewSummaryData }) {
  if (summary.count === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="font-display text-4xl font-semibold tabular-nums">
          {summary.average.toFixed(1)}
        </p>
        <StarRating value={summary.average} starClassName="h-5 w-5" />
        <p className="text-xs text-muted-foreground">
          Based on {summary.count} {summary.count === 1 ? "review" : "reviews"}
        </p>
      </div>

      <ul className="space-y-1.5" aria-label="Rating breakdown">
        {summary.distribution.map((d) => (
          <li key={d.rating} className="flex items-center gap-2 text-xs">
            <span className="w-10 shrink-0 tabular-nums">{d.rating} star</span>
            <span className="h-1.5 flex-1 overflow-hidden bg-secondary">
              <span
                className="block h-full bg-foreground"
                style={{ width: `${(d.count / summary.count) * 100}%` }}
              />
            </span>
            <span className="w-6 shrink-0 text-right tabular-nums text-muted-foreground">
              {d.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
