import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: {
      email,
      name: "Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  const apparel = await prisma.category.upsert({
    where: { slug: "apparel" },
    update: {},
    create: { name: "Apparel", slug: "apparel" },
  });
  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: { name: "Accessories", slug: "accessories" },
  });

  const samples = [
    {
      slug: "classic-tee",
      name: "Classic Tee",
      description: "Heavyweight cotton tee.",
      priceCents: 2500,
      stock: 40,
      categoryId: apparel.id,
      isFeatured: true,
    },
    {
      slug: "canvas-tote",
      name: "Canvas Tote",
      description: "Everyday carry tote.",
      priceCents: 1800,
      stock: 25,
      categoryId: accessories.id,
      isFeatured: true,
    },
  ];

  for (const s of samples) {
    await prisma.product.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
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
