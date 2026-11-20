import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { SubscriberActions } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const where: Prisma.SubscriberWhereInput = q
    ? { email: { contains: q, mode: "insensitive" } }
    : {};

  const [rows, total, active] = await Promise.all([
    prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.subscriber.count({ where }),
    prisma.subscriber.count({ where: { status: "ACTIVE" } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) =>
    `/admin/subscribers?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">
          Subscribers ({active} active / {total} shown)
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/api/admin/export/subscribers" download>Export CSV</Link>
        </Button>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search email…"
          className="h-9 w-full max-w-sm border bg-background px-3 text-sm"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="divide-y border text-sm">
        {rows.length === 0 && (
          <p className="p-4 text-muted-foreground">No subscribers found.</p>
        )}
        {rows.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 p-3"
          >
            <div>
              <p>{s.email}</p>
              <p className="text-xs text-muted-foreground">
                {s.source} · {s.createdAt.toLocaleDateString("en-GB")} ·{" "}
                {s.status === "ACTIVE" ? "Active" : "Unsubscribed"}
              </p>
            </div>
            <SubscriberActions
              id={s.id}
              status={s.status}
              preference={s.departmentPreference}
            />
          </div>
        ))}
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
