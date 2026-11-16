import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/money";
import { DeleteProductButton } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.ProductWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { designer: { contains: q, mode: "insensitive" } },
          { id: { contains: q } },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        sizes: { orderBy: { position: "asc" } },
        images: { orderBy: { position: "asc" }, take: 1 },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) =>
    `/admin/products?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Products ({total})</h1>
        <Button asChild>
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title, designer or id…"
          className="h-9 w-full max-w-sm border bg-background px-3 text-sm"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="divide-y border text-sm">
        {rows.length === 0 && (
          <p className="p-4 text-muted-foreground">No products found.</p>
        )}
        {rows.map((p) => {
          const total = p.sizes.reduce((n, s) => n + s.stock, 0);
          return (
            <div key={p.id} className="flex flex-wrap items-center gap-4 p-3">
              <div className="h-16 w-14 shrink-0 bg-muted">
                {p.images[0] && (
                  <CldImage
                    src={p.images[0].publicId}
                    width={112}
                    height={128}
                    crop="fill"
                    gravity="auto"
                    alt={p.title}
                    className="h-16 w-14 object-cover"
                  />
                )}
              </div>
              <div className="min-w-48 flex-1">
                <p className="text-xs uppercase text-muted-foreground">
                  {p.designer}
                </p>
                <Link
                  href={`/product/${p.id}`}
                  className="font-medium hover:underline"
                >
                  {p.title}
                </Link>
                <p className="text-xs text-muted-foreground">{p.id}</p>
              </div>
              <Price usdCents={p.priceUsdCents} />
              <div className="w-40 text-xs">
                <p className={total === 0 ? "text-destructive" : ""}>
                  {total === 0 ? "Sold out" : `${total} in stock`}
                </p>
                <p className="text-muted-foreground">
                  {p.sizes.map((s) => `${s.size}:${s.stock}`).join("  ")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/products/${p.id}/edit`}>Edit</Link>
                </Button>
                <DeleteProductButton id={p.id} title={p.title} />
              </div>
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
