import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { requirePageUser } from "@/lib/guards";
import { getUserOrders } from "@/lib/queries";
import { ORDER_STATUS_LABEL } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requirePageUser("/orders");
  const orders = await getUserOrders(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Your orders</h1>
      {orders.length === 0 && (
        <p className="text-muted-foreground">No orders yet.</p>
      )}
      <div className="divide-y border">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="flex justify-between p-4 text-sm hover:bg-muted"
          >
            <span>
              {o.orderNumber} · {o.createdAt.toLocaleDateString("en-GB")}
            </span>
            <span>
              {ORDER_STATUS_LABEL[o.status]} ·{" "}
              {formatMoney(o.totalUsdCents, o.currency)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
