import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import {
  NEXT_STATUSES,
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  type OrderStatusKey,
} from "@/lib/labels";
import { OrderStatusSelect } from "@/components/orders/order-controls";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

const isStatus = (v: string | undefined): v is OrderStatusKey =>
  !!v && (ORDER_STATUSES as readonly string[]).includes(v);

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    pay?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const pay = sp.pay === "PAID" || sp.pay === "UNPAID" ? sp.pay : "";

  const where: Prisma.OrderWhereInput = {
    ...(isStatus(sp.status) ? { status: sp.status } : {}),
    ...(pay ? { paymentStatus: pay } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { customerEmail: { contains: q, mode: "insensitive" } },
            { customerName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) =>
    `/admin/orders?${new URLSearchParams({
      ...(q ? { q } : {}),
      ...(isStatus(sp.status) ? { status: sp.status } : {}),
      ...(pay ? { pay } : {}),
      page: String(p),
    })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Orders ({total})</h1>
        <Button asChild variant="outline" size="sm">
          <a href="/api/admin/export/orders">Export CSV</a>
        </Button>
      </div>

      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Order number, name or email…"
          className="h-9 w-64 border bg-background px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="h-9 border bg-background px-3 text-sm"
        >
          <option value="">Any status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          name="pay"
          defaultValue={pay}
          className="h-9 border bg-background px-3 text-sm"
        >
          <option value="">Any payment</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="divide-y border text-sm">
        {orders.length === 0 && (
          <p className="p-4 text-muted-foreground">No orders match.</p>
        )}
        {orders.map((o) => {
          // Fulfilment needs payment; unpaid orders can only be cancelled (same rule the server enforces)
          const allowed =
            o.paymentStatus === "PAID"
              ? NEXT_STATUSES[o.status]
              : NEXT_STATUSES[o.status].filter((s) => s === "CANCELLED");
          return (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3"
            >
              <div>
                <Link
                  href={`/orders/${o.id}`}
                  className="font-medium underline"
                >
                  {o.orderNumber}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {o.createdAt.toLocaleString("en-GB")}
                </p>
              </div>
              <div className="min-w-40">
                <p>{o.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {o.customerEmail}
                </p>
              </div>
              <span>{formatMoney(o.totalUsdCents, o.currency, o.fxRate)}</span>
              <span
                className={
                  o.paymentStatus === "PAID" ? "" : "text-muted-foreground"
                }
              >
                {o.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
              </span>
              <span>{ORDER_STATUS_LABEL[o.status]}</span>
              <OrderStatusSelect orderId={o.id} allowed={allowed} />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {page} of {pages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={href(page - 1)}>Previous</Link>
            </Button>
          )}
          {page < pages && (
            <Button asChild variant="outline" size="sm">
              <Link href={href(page + 1)}>Next</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
