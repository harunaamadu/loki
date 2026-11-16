import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { INITIAL_PRODUCTS } from "./seed-data/catalog";
import { PRODUCT_IMAGES, cloudinaryUrl } from "./seed-data/cloudinary-images";

const DEPARTMENT = { Women: "WOMEN", Men: "MEN", Kids: "KIDS" } as const;
const CATEGORY = {
  Clothing: "CLOTHING",
  Bags: "BAGS",
  Shoes: "SHOES",
  Jewelry: "JEWELRY",
  Accessories: "ACCESSORIES",
} as const;
const CONDITION = {
  "New Season": "NEW_SEASON",
  Conscious: "CONSCIOUS",
  "Pre-Owned": "PRE_OWNED",
} as const;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? "admin@example.com"
  ).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", emailVerified: new Date() },
    create: {
      email,
      name: "Admin",
      role: "ADMIN",
      emailVerified: new Date(),
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  await prisma.promoCode.upsert({
    where: { code: "LOKI10" },
    update: {},
    create: { code: "LOKI10", percentOff: 10 },
  });
  await prisma.promoCode.upsert({
    where: { code: "ACCRAVIP" },
    update: {},
    create: {
      code: "ACCRAVIP",
      amountOffUsdCents: 15_000,
      minSubtotalUsdCents: 100_000,
    },
  });

  for (const p of INITIAL_PRODUCTS) {
    const data = {
      department: DEPARTMENT[p.department as keyof typeof DEPARTMENT],
      designer: p.designer,
      title: p.title,
      category: CATEGORY[p.category as keyof typeof CATEGORY],
      subcategory: p.subcategory ?? null,
      priceUsdCents: Math.round(p.priceUsd * 100),
      originalPriceUsdCents: p.originalPriceUsd
        ? Math.round(p.originalPriceUsd * 100)
        : null,
      color: p.color ?? null,
      material: p.material ?? null,
      condition: CONDITION[p.condition as keyof typeof CONDITION],
      boutique: p.boutique ?? null,
    };
    const sizes = Object.entries(p.sizeStock).map(([size, stock], position) => ({
      size,
      stock: stock as number,
      position,
    }));
    const images = (PRODUCT_IMAGES[p.id] ?? []).map((img, position) => ({
      publicId: img.publicId,
      url: cloudinaryUrl(img.publicId),
      width: img.width,
      height: img.height,
      position,
    }));

    await prisma.product.upsert({
      where: { id: p.id },
      update: data,
      create: {
        id: p.id,
        ...data,
        sizes: { create: sizes },
        images: { create: images },
      },
    });
    // Re-seeding refreshes images without duplicating them.
    await prisma.productImage.deleteMany({ where: { productId: p.id } });
    await prisma.productImage.createMany({
      data: images.map((i) => ({ ...i, productId: p.id })),
    });
  }
  console.log("Seed complete. Admin:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
