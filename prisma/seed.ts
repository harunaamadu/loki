import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

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

  const samples = [
    {
      id: "sample-tote-1",
      department: "WOMEN" as const,
      designer: "Atelier Nord",
      title: "Structured Leather Tote",
      category: "BAGS" as const,
      priceUsdCents: 189000,
      originalPriceUsdCents: 240000,
      condition: "NEW_SEASON" as const,
      color: "Black",
      material: "Calf leather",
      boutique: "Milan",
      sizes: [{ size: "One Size", stock: 3 }],
    },
    {
      id: "sample-jacket-1",
      department: "MEN" as const,
      designer: "Maison Eko",
      title: "Wool Overshirt",
      category: "CLOTHING" as const,
      priceUsdCents: 64000,
      originalPriceUsdCents: null,
      condition: "CONSCIOUS" as const,
      color: "Charcoal",
      material: "Virgin wool",
      boutique: "Paris",
      sizes: [
        { size: "S", stock: 2 },
        { size: "M", stock: 0 },
        { size: "L", stock: 4 },
      ],
    },
  ];

  for (const { sizes, ...p } of samples) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        ...p,
        sizes: { create: sizes.map((s, position) => ({ ...s, position })) },
      },
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
