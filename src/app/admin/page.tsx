import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 3600 * 1000);

export default async function AdminOverviewPage() {
  const since = daysAgo(30);

  const [toProcess, unpaid, pendingAlerts, activeSubs, revenue, lowStock] =
    await Promise.all([
      prisma.order.count({
        where: {
          paymentStatus: "PAID",
          status: { in: ["ORDER_PLACED", "BOUTIQUE_AUTHENTICATION"] },
        },
      }),
      prisma.order.count({
        where: { paymentStatus: "UNPAID", status: "ORDER_PLACED" },
      }),
      prisma.restockAlert.count({ where: { status: "PENDING" } }),
      prisma.subscriber.count({ where: { status: "ACTIVE" } }),
      prisma.order.aggregate({
        _sum: { totalUsdCents: true },
        where: {
          paymentStatus: "PAID",
          status: { not: "CANCELLED" },
          paidAt: { gte: since },
        },
      }),
      prisma.productSize.findMany({
        where: { stock: { lte: 2 } },
        orderBy: { stock: "asc" },
        take: 15,
        include: {
          product: { select: { id: true, title: true, designer: true } },
        },
      }),
    ]);

  const cards: [string, string | number, string][] = [
    [
      "Paid orders to process",
      toProcess,
      "/admin/orders?pay=PAID&status=ORDER_PLACED",
    ],
    [
      "Awaiting payment",
      unpaid,
      "/admin/orders?pay=UNPAID&status=ORDER_PLACED",
    ],
    ["Pending restock alerts", pendingAlerts, "/admin/restock-alerts"],
    ["Active subscribers", activeSubs, "/admin/subscribers"],
    [
      "Revenue, last 30 days",
      formatMoney(revenue._sum.totalUsdCents ?? 0, "USD"),
      "/admin/orders?pay=PAID",
    ],
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Overview</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="border p-4 hover:bg-muted">
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Low and sold-out sizes</h2>
        {lowStock.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing running low.</p>
        )}
        <div className="divide-y border text-sm">
          {lowStock.map((s) => (
            <div
              key={`${s.productId}-${s.size}`}
              className="flex justify-between p-3"
            >
              <Link
                href={`/admin/products/${s.product.id}/edit`}
                className="underline"
              >
                {s.product.designer} · {s.product.title}
              </Link>
              <span className={s.stock === 0 ? "text-destructive" : ""}>
                Size {s.size}: {s.stock === 0 ? "sold out" : `${s.stock} left`}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
