import { prisma } from "@/lib/prisma";
import type { ProductListItem } from "@/lib/types";

type Row = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stock: number;
  category: { name: string; slug: string };
  images: {
    publicId: string;
    url: string;
    width: number | null;
    height: number | null;
  }[];
};

function toListItem(p: Row): ProductListItem {
  const img = p.images[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    priceCents: p.priceCents,
    compareAtPriceCents: p.compareAtPriceCents,
    stock: p.stock,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    image: img
      ? {
          publicId: img.publicId,
          url: img.url,
          width: img.width,
          height: img.height,
        }
      : null,
  };
}

export async function getProducts(
  opts: { featured?: boolean; take?: number } = {},
) {
  const rows = await prisma.product.findMany({
    where: { isActive: true, ...(opts.featured ? { isFeatured: true } : {}) },
    orderBy: { createdAt: "desc" },
    take: opts.take,
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });
  return rows.map(toListItem);
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}
