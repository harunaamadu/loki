import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteReviewButton } from "@/components/reviews/delete-review-button";
import { StarRating } from "@/components/reviews/star-rating";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { id: true, title: true, designer: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Reviews</h1>
      <p className="text-xs text-muted-foreground">
        Latest 50. Reviews are published immediately; delete anything
        inappropriate.
      </p>

      <div className="divide-y border text-sm">
        {reviews.length === 0 && (
          <p className="p-4 text-muted-foreground">No reviews yet.</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="space-y-2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/product/${r.product.id}#reviews`}
                className="font-medium underline"
              >
                {r.product.designer} · {r.product.title}
              </Link>
              <StarRating value={r.rating} />
            </div>
            {r.title && <p className="font-medium">{r.title}</p>}
            <p className="whitespace-pre-line text-muted-foreground">
              {r.body}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
              <span>
                {r.user.name ?? "Customer"} ({r.user.email})
              </span>
              <span>{r.createdAt.toLocaleString("en-GB")}</span>
              {r.verifiedPurchase && <span>Verified purchase</span>}
              <DeleteReviewButton id={r.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
