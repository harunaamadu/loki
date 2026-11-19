"use client";

import { useState, useTransition } from "react";
import { BadgeCheck } from "lucide-react";
import { loadReviewsAction } from "@/actions/review";
import { Button } from "@/components/ui/button";
import { DeleteReviewButton } from "@/components/reviews/delete-review-button";
import { StarRating } from "@/components/reviews/star-rating";
import {
  REVIEW_SORTS,
  REVIEW_SORT_LABEL,
  formatReviewDate,
  type ReviewDTO,
  type ReviewSort,
} from "@/lib/reviews";

interface Props {
  productId: string;
  initial: ReviewDTO[];
  total: number;
  canModerate: boolean;
}

export function ReviewList({
  productId,
  initial,
  total: initialTotal,
  canModerate,
}: Props) {
  const [reviews, setReviews] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, start] = useTransition();

  function load(nextSort: ReviewSort, nextPage: number, append: boolean) {
    setError(null);
    start(async () => {
      const res = await loadReviewsAction({
        productId,
        sort: nextSort,
        page: nextPage,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPage(nextPage);
      setTotal(res.data.total);
      setReviews((prev) =>
        append
          ? [
              ...prev,
              ...res.data.reviews.filter(
                (r) => !prev.some((p) => p.id === r.id),
              ),
            ]
          : res.data.reviews,
      );
    });
  }

  if (total === 0 && reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Be the first to review this piece.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {total} {total === 1 ? "review" : "reviews"}
        </p>
        <select
          aria-label="Sort reviews"
          value={sort}
          onChange={(e) => {
            const next = e.target.value as ReviewSort;
            setSort(next);
            load(next, 0, false);
          }}
          className="h-8 border bg-background px-2 text-xs"
        >
          {REVIEW_SORTS.map((s) => (
            <option key={s} value={s}>
              {REVIEW_SORT_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <ul
        className={
          loading ? "opacity-60 transition-opacity" : "transition-opacity"
        }
      >
        {reviews.map((r) => (
          <li key={r.id} className="space-y-2 border-b py-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StarRating value={r.rating} />
              {r.title && <h3 className="text-sm font-medium">{r.title}</h3>}
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed">
              {r.body}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="text-foreground">{r.authorName}</span>
              <span>
                {formatReviewDate(r.createdAt)}
                {r.edited && " (edited)"}
              </span>
              {r.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-foreground">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  Verified purchase
                </span>
              )}
              {r.isMine && (
                <span className="border px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                  Your review
                </span>
              )}
              {(r.isMine || canModerate) && <DeleteReviewButton id={r.id} />}
            </div>
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {reviews.length < total && (
        <div className="pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => load(sort, page + 1, true)}
          >
            {loading
              ? "Loading…"
              : `Show more reviews (${total - reviews.length})`}
          </Button>
        </div>
      )}
    </div>
  );
}
