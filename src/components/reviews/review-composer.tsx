"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitReviewAction } from "@/actions/review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarInput } from "@/components/reviews/star-input";
import {
  REVIEW_BODY_MAX,
  REVIEW_BODY_MIN,
  REVIEW_TITLE_MAX,
  type MyReview,
} from "@/lib/reviews";

interface Props {
  productId: string;
  productTitle: string;
  state: "guest" | "unverified" | "ready";
  existing: MyReview | null;
}

export function ReviewComposer({
  productId,
  productTitle,
  state,
  existing,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (state === "guest") {
    return (
      <div className="space-y-3">
        <p className="text-sm">
          Bought this piece, or know it well? Share your thoughts with other
          customers.
        </p>
        <Button asChild variant="outline">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/product/${productId}#reviews`)}`}
          >
            Sign in to write a review
          </Link>
        </Button>
      </div>
    );
  }

  if (state === "unverified") {
    return (
      <p className="text-sm text-muted-foreground">
        Verify your email address to write a review.
      </p>
    );
  }

  if (!open) {
    return (
      <div className="space-y-3">
        <p className="text-sm">
          {existing
            ? "You've reviewed this piece. You can update your review at any time."
            : "Share your thoughts with other customers."}
        </p>
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          {existing ? "Edit your review" : "Write a review"}
        </Button>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (rating === 0) {
      setError("Please choose a star rating.");
      return;
    }
    start(async () => {
      const res = await submitReviewAction({
        productId,
        rating,
        title: title.trim() || null,
        body,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success(
        res.data.updated ? "Review updated" : "Thank you for your review",
      );
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 border p-5"
      aria-label={`Review ${productTitle}`}
    >
      <h3 className="text-sm font-semibold">
        {existing ? "Edit your review" : "Write a review"} of {productTitle}
      </h3>

      <div className="space-y-2">
        <Label asChild>
          <span>Rating</span>
        </Label>
        <StarInput
          value={rating}
          onChange={setRating}
          invalid={!!error && rating === 0}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title">
          Title{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="review-title"
          value={title}
          maxLength={REVIEW_TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum it up in a few words"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-body">Your review</Label>
        <Textarea
          id="review-body"
          required
          rows={5}
          value={body}
          maxLength={REVIEW_BODY_MAX}
          minLength={REVIEW_BODY_MIN}
          onChange={(e) => setBody(e.target.value)}
          placeholder="How is the quality, fit and finish? Would you recommend it?"
          aria-describedby="review-body-hint"
        />
        <p id="review-body-hint" className="text-xs text-muted-foreground">
          {body.length}/{REVIEW_BODY_MAX} · Links aren&apos;t allowed.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : existing ? "Save changes" : "Submit review"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
