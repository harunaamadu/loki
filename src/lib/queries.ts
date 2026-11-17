import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Department, Prisma, ProductCategory } from "@/generated/prisma/client";
import type { BagLine, ProductDetail, ProductListItem } from "@/lib/types";

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