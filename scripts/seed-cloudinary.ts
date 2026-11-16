import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { INITIAL_PRODUCTS } from "../prisma/seed-data/catalog";

// Links the images in your Cloudinary `loki` folder to catalog products.
//
// Usage:
//   npx tsx scripts/seed-cloudinary.ts --dry-run      (show matches only)
//   npx tsx scripts/seed-cloudinary.ts                (upsert products + images)
//   npx tsx scripts/seed-cloudinary.ts --folder=loki/products
//
// Matching: each catalog product's old local filename (e.g. bag_woven_leather_1794776657063.jpg)
// is matched against the Cloudinary public_id / display_name. Cloudinary appends a random suffix
// on upload, so we match on "contains", not equality.

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Asset = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  display_name?: string;
  resource_type?: string;
};

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

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

async function listAssets(folder: string): Promise<Asset[]> {
  let rows: Asset[] = [];
  let cursor: string | undefined;
  try {
    do {
      const r = await cloudinary.api.resources_by_asset_folder(folder, {
        max_results: 100,
        next_cursor: cursor,
      });
      rows = rows.concat(r.resources as Asset[]);
      cursor = r.next_cursor as string | undefined;
    } while (cursor);
  } catch {
    rows = [];
  }
  if (rows.length === 0) {
    // Fixed-folder accounts: folder is part of the public_id
    const r = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: `${folder}/`,
      max_results: 500,
    });
    rows = r.resources as Asset[];
  }
  return rows.filter((x) => !x.resource_type || x.resource_type === "image");
}

function findAsset(assets: Asset[], localPath: string): Asset | undefined {
  const base = localPath.split("/").pop()!.replace(/\.[a-z0-9]+$/i, "");
  const key = norm(base);
  const keyNoStamp = norm(base.replace(/_\d{10,}$/, ""));
  const hay = (a: Asset) => norm(`${a.public_id} ${a.display_name ?? ""}`);
  return (
    assets.find((a) => hay(a).includes(key)) ??
    assets.find((a) => hay(a).includes(keyNoStamp))
  );
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const folder =
    process.argv.find((a) => a.startsWith("--folder="))?.split("=")[1] ?? "loki";

  const assets = await listAssets(folder);
  console.log(`Found ${assets.length} image(s) in "${folder}"\n`);

  const used = new Set<string>();
  let linked = 0;

  for (const p of INITIAL_PRODUCTS) {
    const asset = findAsset(assets, p.imageUrl);
    if (!asset) {
      console.log(`✗ ${p.id.padEnd(14)} no match for ${p.imageUrl}`);
      continue;
    }
    used.add(asset.public_id);
    console.log(`✓ ${p.id.padEnd(14)} → ${asset.public_id}`);
    linked++;
    if (dry) continue;

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

    await prisma.$transaction([
      prisma.product.upsert({
        where: { id: p.id },
        update: data,
        create: { id: p.id, ...data },
      }),
      prisma.productSize.deleteMany({ where: { productId: p.id } }),
      prisma.productSize.createMany({
        data: Object.entries(p.sizeStock).map(([size, stock], position) => ({
          productId: p.id,
          size,
          stock: stock as number,
          position,
        })),
      }),
      prisma.productImage.deleteMany({ where: { productId: p.id } }),
      prisma.productImage.create({
        data: {
          productId: p.id,
          publicId: asset.public_id,
          url: asset.secure_url,
          width: asset.width ?? null,
          height: asset.height ?? null,
          position: 0,
        },
      }),
    ]);
  }

  const spare = assets.filter((a) => !used.has(a.public_id));
  console.log(`\n${linked}/${INITIAL_PRODUCTS.length} products linked${dry ? " (dry run)" : ""}.`);
  if (spare.length) {
    console.log(`\nUnused assets (add as extra images in /admin/products):`);
    for (const a of spare) console.log(`  ${a.public_id}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
