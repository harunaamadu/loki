import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CATALOG } from "./seed-data/products";
import { PRODUCT_IMAGES, cloudinaryUrl } from "./seed-data/cloudinary-images";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const imageRows = (productId: string) =>
  (PRODUCT_IMAGES[productId] ?? []).map((img, position) => ({
    publicId: img.publicId,
    url: cloudinaryUrl(img.publicId),
    width: img.width,
    height: img.height,
    position,
  }));

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
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
  console.log("Admin:", email);
}

async function seedPromoCodes() {
  await prisma.promoCode.upsert({
    where: { code: "LOKI10" },
    update: {},
    create: { code: "LOKI10", percentOff: 10 },
  });
  await prisma.promoCode.upsert({
    where: { code: "ACCRAVIP" },
    update: {},
    create: { code: "ACCRAVIP", amountOffUsdCents: 15_000, minSubtotalUsdCents: 100_000 },
  });
}

/**
 * Safe to re-run: never overwrites prices or stock of an existing product.
 * For an existing product it only attaches images if the product has none.
 */
async function seedCatalog() {
  // Remove the two dummy products from the first seed
  const removed = await prisma.product.deleteMany({ where: { id: { startsWith: "sample-" } } });
  if (removed.count) console.log(`Removed ${removed.count} sample product(s)`);

  let created = 0;
  let imaged = 0;
  for (const { sizes, ...p } of CATALOG) {
    const images = imageRows(p.id);
    const existing = await prisma.product.findUnique({
      where: { id: p.id },
      select: { _count: { select: { images: true } } },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          ...p,
          sizes: { create: sizes.map(([size, stock], position) => ({ size, stock, position })) },
          images: { create: images },
        },
      });
      created++;
    } else if (existing._count.images === 0 && images.length > 0) {
      await prisma.productImage.createMany({ data: images.map((i) => ({ ...i, productId: p.id })) });
      imaged++;
    }
  }
  console.log(`Catalog: ${created} created, ${imaged} existing product(s) got images, ${CATALOG.length} total`);
}

async function main() {
  await seedAdmin();
  await seedPromoCodes();
  await seedCatalog();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());