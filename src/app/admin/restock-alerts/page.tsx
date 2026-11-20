import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { RestockAlertActions } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminRestockAlertsPage() {
  const [demand, alerts] = await Promise.all([
    prisma.restockAlert.groupBy({
      by: ["productId", "size", "productTitle", "designer"],
      where: { status: "PENDING" },
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 15,
    }),
    prisma.restockAlert.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Restock alerts</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/api/admin/export/restock-alerts" download>Export CSV</Link>
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Most wanted (pending)</h2>
        {demand.length === 0 && (
          <p className="text-sm text-muted-foreground">No pending requests.</p>
        )}
        <div className="divide-y border text-sm">
          {demand.map((d) => (
            <div
              key={`${d.productId}-${d.size}`}
              className="flex justify-between p-3"
            >
              <Link
                href={`/admin/products/${d.productId}/edit`}
                className="underline"
              >
                {d.designer} · {d.productTitle} ({d.size})
              </Link>
              <span>
                {d._count._all} {d._count._all === 1 ? "customer" : "customers"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Latest 100 alerts</h2>
        <p className="text-xs text-muted-foreground">
          Customers are emailed automatically when you save a product with a
          size going from 0 to in stock.
        </p>
        <div className="divide-y border text-sm">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3"
            >
              <div>
                <p>
                  {a.designer} · {a.productTitle} ({a.size})
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.email} · {a.createdAt.toLocaleDateString("en-GB")}
                </p>
              </div>
              <span className="text-xs uppercase">
                {a.status === "PENDING" ? "Pending" : "Notified"}
              </span>
              <RestockAlertActions id={a.id} status={a.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
