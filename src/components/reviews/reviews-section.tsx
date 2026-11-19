import { ReviewComposer } from "@/components/reviews/review-composer";
import { ReviewList } from "@/components/reviews/review-list";
import { ReviewSummaryCard } from "@/components/reviews/review-summary";
import { getMyReview, getReviewSummary, getReviewsPage } from "@/lib/queries";

interface Props {
  productId: string;
  productTitle: string;
  viewer: { id: string; role: "USER" | "ADMIN"; verified: boolean } | null;
}

export async function ReviewsSection({
  productId,
  productTitle,
  viewer,
}: Props) {
  const [summary, first, mine] = await Promise.all([
    getReviewSummary(productId),
    getReviewsPage(productId, "newest", 0, viewer?.id ?? null),
    viewer ? getMyReview(productId, viewer.id) : Promise.resolve(null),
  ]);

  const state = !viewer ? "guest" : viewer.verified ? "ready" : "unverified";
  // Remounts the list (and resets its sort and pages) whenever reviews change
  const listKey = `${summary.sum}:${summary.count}:${mine?.updatedAt ?? ""}`;

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="scroll-mt-24 space-y-8 border-t pt-10"
    >
      <h2
        id="reviews-heading"
        className="text-sm font-semibold uppercase tracking-[0.12em]"
      >
        Customer reviews
      </h2>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <ReviewSummaryCard summary={summary} />
        <ReviewComposer
          productId={productId}
          productTitle={productTitle}
          state={state}
          existing={mine}
        />
      </div>

      <ReviewList
        key={listKey}
        productId={productId}
        initial={first.reviews}
        total={first.total}
        canModerate={viewer?.role === "ADMIN"}
      />
    </section>
  );
}
