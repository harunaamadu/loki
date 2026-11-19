import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Department, Prisma, ProductCategory } from "@/generated/prisma/client";
import type { BagLine, ProductDetail, ProductListItem } from "@/lib/types";
import { slugify } from "./utils";

import { REVIEW_PAGE_SIZE, displayName, type MyReview, type ReviewDTO, type ReviewSort, type ReviewSummaryData } from "@/lib/reviews";

const productInclude = {
  sizes: { orderBy: { position: "asc" } },
  images: { orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;

export type ProductRow = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

function toListItem(p: ProductRow): ProductListItem {
  return {
    id: p.id,
    department: p.department,
    designer: p.designer,
    title: p.title,
    category: p.category,
    condition: p.condition,
    priceUsdCents: p.priceUsdCents,
    originalPriceUsdCents: p.originalPriceUsdCents,
    imagePublicId: p.images[0]?.publicId ?? null,
    secondImagePublicId: p.images[1]?.publicId ?? null,
    sizes: p.sizes.map((s) => ({ size: s.size, stock: s.stock })),
    totalStock: p.sizes.reduce((n, s) => n + s.stock, 0),
  };
}

function toDetail(p: ProductRow): ProductDetail {
  return {
    ...toListItem(p),
    subcategory: p.subcategory,
    color: p.color,
    material: p.material,
    boutique: p.boutique,
    imagePublicIds: p.images.map((i) => i.publicId),
  };
}

export async function getProducts(opts: { take?: number } = {}) {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: opts.take,
    include: productInclude,
  });
  return rows.map(toListItem);
}

export async function getProductRow(id: string) {
  return prisma.product.findUnique({ where: { id }, include: productInclude });
}

export const getProductById = cache(async (id: string) => {
  const row = await getProductRow(id);
  return row ? toDetail(row) : null;
});

export async function getBagForUser(userId: string): Promise<BagLine[]> {
  const rows = await prisma.bagItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          sizes: true,
        },
      },
    },
  });
  return rows.map((r) => ({
    productId: r.productId,
    size: r.size,
    quantity: r.quantity,
    title: r.product.title,
    designer: r.product.designer,
    priceUsdCents: r.product.priceUsdCents,
    imagePublicId: r.product.images[0]?.publicId ?? null,
    stock: r.product.sizes.find((s) => s.size === r.size)?.stock ?? 0,
  }));
}

export async function getWishlistIds(userId: string) {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}

export async function getWishlistProducts(userId: string) {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: productInclude } },
  });
  return rows.map((r) => toListItem(r.product));
}

export async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      phone: true,
      city: true,
      country: true,
      streetAddress: true,
      currency: true,
      emailVerified: true,
    },
  });
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({ where: { id }, include: { items: true } });
}

export async function getAllOrders() {
  return prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}

export async function getRelatedProducts(
  p: { id: string; category: ProductCategory; department: Department | null },
  take = 4,
) {
  const rows = await prisma.product.findMany({
    where: {
      id: { not: p.id },
      category: p.category,
      ...(p.department ? { department: p.department } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    include: productInclude,
  });
  return rows.map(toListItem);
}

export async function getDepartmentCounts() {
  const [byDepartment, preOwned] = await Promise.all([
    prisma.product.groupBy({ by: ["department"], _count: { _all: true } }),
    prisma.product.count({ where: { condition: "PRE_OWNED" } }),
  ]);
  const count = (d: string) => byDepartment.find((r) => r.department === d)?._count._all ?? 0;
  return { WOMEN: count("WOMEN"), MEN: count("MEN"), KIDS: count("KIDS"), PRE_OWNED: preOwned };
}

export async function getBoutiques() {
  const rows = await prisma.product.groupBy({
    by: ["boutique"],
    where: { boutique: { not: null } },
    _count: { _all: true },
  });
  return rows
    .flatMap((r) => (r.boutique ? [{ name: r.boutique, slug: slugify(r.boutique), count: r._count._all }] : []))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export async function getProductsByBoutique(slug: string) {
  const boutique = (await getBoutiques()).find((b) => b.slug === slug);
  if (!boutique) return null;
  const rows = await prisma.product.findMany({
    where: { boutique: boutique.name },
    orderBy: { createdAt: "desc" },
    include: productInclude,
  });
  return { name: boutique.name, products: rows.map(toListItem) };
}

export async function getDesigners() {
  const rows = await prisma.product.groupBy({ by: ["designer"], _count: { _all: true } });
  return rows
    .map((r) => ({ name: r.designer, count: r._count._all }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

/** Returns products in the same order as `ids`; ids that no longer exist are dropped. */
export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({ where: { id: { in: ids } }, include: productInclude });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [toListItem(row)] : [];
  });
}

export async function computeReviewSummary(productId: string): Promise<ReviewSummaryData> {
  const rows = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: { _all: true },
  });
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: rows.find((r) => r.rating === rating)?._count._all ?? 0,
  }));
  const count = distribution.reduce((n, d) => n + d.count, 0);
  const sum = distribution.reduce((n, d) => n + d.rating * d.count, 0);
  return { count, sum, average: count ? sum / count : 0, distribution };
}

/** Cached per request, so the page header, structured data and reviews section share one query. */
export const getReviewSummary = cache(computeReviewSummary);

export async function getReviewsPage(productId: string, sort: ReviewSort, page: number, viewerId: string | null) {
  const orderBy: Prisma.ReviewOrderByWithRelationInput[] =
    sort === "highest"
      ? [{ rating: "desc" }, { createdAt: "desc" }, { id: "asc" }]
      : sort === "lowest"
        ? [{ rating: "asc" }, { createdAt: "desc" }, { id: "asc" }]
        : [{ createdAt: "desc" }, { id: "asc" }];

  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy,
      skip: page * REVIEW_PAGE_SIZE,
      take: REVIEW_PAGE_SIZE,
      include: { user: { select: { name: true } } },
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  const reviews: ReviewDTO[] = rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    authorName: displayName(r.user.name),
    verifiedPurchase: r.verifiedPurchase,
    createdAt: r.createdAt.toISOString(),
    edited: r.updatedAt.getTime() - r.createdAt.getTime() > 60_000,
    isMine: viewerId !== null && r.userId === viewerId,
  }));
  return { reviews, total };
}

export async function getMyReview(productId: string, userId: string): Promise<MyReview | null> {
  const r = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true, rating: true, title: true, body: true, updatedAt: true },
  });
  return r ? { ...r, updatedAt: r.updatedAt.toISOString() } : null;
}

/** Hero image and department tile images come from your newest products' photos, so no IDs are hard-coded. */
export async function getHomeShowcase() {
  const pick = (where: Prisma.ProductImageWhereInput) =>
    prisma.productImage.findFirst({
      where,
      orderBy: [{ product: { createdAt: "desc" } }, { position: "asc" }],
      select: { publicId: true },
    });

  const [hero, women, men, kids] = await Promise.all([
    pick({}),
    pick({ product: { department: "WOMEN" } }),
    pick({ product: { department: "MEN" } }),
    pick({ product: { department: "KIDS" } }),
  ]);

  return {
    hero: hero?.publicId ?? null,
    departments: {
      WOMEN: women?.publicId ?? null,
      MEN: men?.publicId ?? null,
      KIDS: kids?.publicId ?? null,
    },
  };
}