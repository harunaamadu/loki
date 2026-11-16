"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProductAction } from "@/actions/product";
import { deleteRestockAlertAction } from "@/actions/restock";
import {
  deleteSubscriberAction,
  setRestockStatusAction,
  updateSubscriberAction,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action";

function useRun() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult>, success: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(success);
        router.refresh();
      } else toast.error(res.error);
    });
  return { pending, run };
}

export function DeleteProductButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const { pending, run } = useRun();
  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(
            `Delete "${title}"? Its images are removed too. Past orders keep their records.`,
          )
        )
          return;
        run(() => deleteProductAction(id), "Product deleted");
      }}
    >
      Delete
    </Button>
  );
}

export function RestockAlertActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const { pending, run } = useRun();
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          run(
            () =>
              setRestockStatusAction(
                id,
                status === "PENDING" ? "NOTIFIED" : "PENDING",
              ),
            "Alert updated",
          )
        }
      >
        {status === "PENDING" ? "Mark notified" : "Reopen"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => run(() => deleteRestockAlertAction(id), "Alert deleted")}
      >
        Delete
      </Button>
    </div>
  );
}

export function SubscriberActions({
  id,
  status,
  preference,
}: {
  id: string;
  status: string;
  preference: string | null;
}) {
  const { pending, run } = useRun();
  const nextStatus = status === "ACTIVE" ? "UNSUBSCRIBED" : "ACTIVE";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        defaultValue={preference ?? ""}
        disabled={pending}
        className="h-8 border bg-background px-2 text-xs"
        onChange={(e) =>
          run(
            () =>
              updateSubscriberAction(id, {
                status,
                departmentPreference:
                  e.target.value === "" ? null : e.target.value,
              }),
            "Preference updated",
          )
        }
      >
        <option value="">No preference</option>
        <option value="ALL">All</option>
        <option value="WOMEN">Women</option>
        <option value="MEN">Men</option>
      </select>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          run(
            () =>
              updateSubscriberAction(id, {
                status: nextStatus,
                departmentPreference: preference,
              }),
            "Status updated",
          )
        }
      >
        {status === "ACTIVE" ? "Unsubscribe" : "Resubscribe"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Delete this subscriber permanently?")) return;
          run(() => deleteSubscriberAction(id), "Subscriber deleted");
        }}
      >
        Delete
      </Button>
    </div>
  );
}
