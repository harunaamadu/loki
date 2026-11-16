"use client"; 

// updated

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  cancelOrderAction,
  payOrderAction,
  updateOrderStatusAction,
} from "@/actions/order";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABEL, type OrderStatusKey } from "@/lib/labels";

export function PayNowButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await payOrderAction(orderId);
          if (res.ok) window.location.assign(res.data.paymentUrl);
          else toast.error(res.error);
        })
      }
    >
      {pending ? "Redirecting…" : "Pay now"}
    </Button>
  );
}

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await cancelOrderAction(orderId);
          if (res.ok) {
            toast.success("Order cancelled");
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      Cancel order
    </Button>
  );
}

export function OrderStatusSelect({
  orderId,
  allowed,
}: {
  orderId: string;
  allowed: OrderStatusKey[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (allowed.length === 0)
    return <span className="text-xs text-muted-foreground">Final</span>;
  return (
    <select
      disabled={pending}
      defaultValue=""
      className="h-8 border bg-background px-2 text-xs"
      onChange={(e) =>
        start(async () => {
          const res = await updateOrderStatusAction(orderId, e.target.value);
          if (res.ok) {
            toast.success("Status updated");
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      <option value="" disabled>
        Move to…
      </option>
      {allowed.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
