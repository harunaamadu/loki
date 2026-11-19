"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteReviewAction } from "@/actions/review";
import { Button } from "@/components/ui/button";

export function DeleteReviewButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this review? This can't be undone."))
          return;
        start(async () => {
          const res = await deleteReviewAction(id);
          if (res.ok) {
            toast.success("Review deleted");
            router.refresh();
          } else toast.error(res.error);
        });
      }}
    >
      Delete
    </Button>
  );
}
