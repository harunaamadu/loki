import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  CATEGORY_LABEL,
  CONDITION_LABEL,
  DEPARTMENT_LABEL,
  DELIVERY_LABEL,
  ORDER_STATUS_LABEL,
  PAYMENT_LABEL,
} from "../src/lib/labels";

// Usage: npx tsx scripts/import-firestore.ts ./firestore-export [--skip-images]
// Safe to re-run: existing rows are skipped.

const dir = process.argv[2] ?? "./firestore-export";
const skipImages = process.argv.includes("--skip-images");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec =>
  !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;
const num = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v)))
    return Number(v);
  return null;
};
const cents = (v: unknown) => Math.round((num(v) ?? 0) * 100);
const int = (v: unknown) => Math.max(0, Math.trunc(num(v) ?? 0));

function toDate(v: unknown): Date {
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (isRec(v)) {
    const sec = num(v._seconds ?? v.seconds);
    if (sec !== null) return new Date(sec * 1000);
  }
  return new Date();
}

const reverse = (m: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(m).map(([k, label]) => [label, k]),
  ) as Record<string, string>;
const DEPT = reverse(DEPARTMENT_LABEL);
const CAT = reverse(CATEGORY_LABEL);
const COND = reverse(CONDITION_LABEL);
const DELIVERY = reverse(DELIVERY_LABEL);
const PAYMENT = reverse(PAYMENT_LABEL);
const STATUS = reverse(ORDER_STATUS_LABEL);

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const sizeRank = (s: string) => {
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  if (i >= 0) return i;
  const n = Number(s);
  return Number.isFinite(n) ? 100 + n : 1000;
};

function load(name: string): Rec[] {
  const file = path.join(dir, `${name}.json`);
  if (!existsSync(file)) {
    console.warn(`(missing ${name}.json, skipping)`);
    return [];
  }
  const data: unknown = JSON.parse(readFileSync(file, "utf8"));
  return Array.isArray(data) ? data.filter(isRec) : [];
}

const report: Record<string, { ok: number; skipped: string[] }> = {};
const track = (k: string) => (report[k] ??= { ok: 0, skipped: [] });

async function uploadImage(
  url: string,
): Promise<{
  publicId: string;
  url: string;
  width: number;
  height: number;
} | null> {
  try {
    const r = await cloudinary.uploader.upload(url, {
      folder: "loki/products",
      resource_type: "image",
    });
    return {
      publicId: r.public_id,
      url: r.secure_url,
      width: r.width,
      height: r.height,
    };
  } catch (e) {
    console.warn("  image upload failed:", url, (e as Error).message);
    return null;
  }
}

async function importProducts() {
  for (const p of load("products")) {
    const t = track("products");
    const id = str(p.id);
    const category = CAT[str(p.category) ?? ""];
    const condition = COND[str(p.condition) ?? ""];
    if (!id || !category || !condition || !str(p.designer) || !str(p.title)) {
      t.skipped.push(id ?? "(no id)");
      continue;
    }
    if (
      await prisma.product.findUnique({ where: { id }, select: { id: true } })
    ) {
      t.skipped.push(`${id} (exists)`);
      continue;
    }

    const rawSizes = isRec(p.sizeStock)
      ? Object.entries(p.sizeStock).map(([size, stock]) => ({
          size,
          stock: int(stock),
        }))
      : [{ size: "One Size", stock: int(p.totalStock) }];
    const sizes = (
      rawSizes.length ? rawSizes : [{ size: "One Size", stock: 0 }]
    ).sort((a, b) => sizeRank(a.size) - sizeRank(b.size));

    const image =
      !skipImages && str(p.imageUrl)
        ? await uploadImage(str(p.imageUrl)!)
        : null;

    await prisma.product.create({
      data: {
        id,
        department: (DEPT[str(p.department) ?? ""] ?? null) as never,
        designer: str(p.designer)!,
        title: str(p.title)!,
        category: category as never,
        subcategory: str(p.subcategory),
        priceUsdCents: Math.max(1, cents(p.priceUsd)),
        originalPriceUsdCents: num(p.originalPriceUsd)
          ? cents(p.originalPriceUsd)
          : null,
        color: str(p.color),
        material: str(p.material),
        condition: condition as never,
        boutique: str(p.boutique),
        createdAt: toDate(p.updatedAt),
        sizes: { create: sizes.map((s, position) => ({ ...s, position })) },
        images: image ? { create: [{ ...image, position: 0 }] } : undefined,
      },
    });
    t.ok++;
  }
}

async function importUsers() {
  const authUsers = load("auth-users");
  const profiles = new Map(
    load("users").map((u) => [str(u.uid) ?? str(u.id) ?? "", u]),
  );
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase());
  const t = track("users");

  const uids = new Set<string>([
    ...authUsers.map((a) => str(a.uid) ?? ""),
    ...profiles.keys(),
  ]);
  uids.delete("");

  for (const uid of uids) {
    const a = authUsers.find((x) => str(x.uid) === uid) ?? {};
    const prof = profiles.get(uid) ?? {};
    const email = (str(a.email) ?? str(prof.email))?.toLowerCase();
    if (!email) {
      t.skipped.push(`${uid} (no email)`);
      continue;
    }

    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, legacyUid: true },
    });
    if (user) {
      if (!user.legacyUid)
        await prisma.user.update({
          where: { id: user.id },
          data: { legacyUid: uid },
        });
      t.skipped.push(`${email} (exists)`);
      continue;
    }

    const providers = Array.isArray(a.providers)
      ? a.providers.filter(isRec)
      : [];
    const googleProviders = providers.filter(
      (p) => str(p.providerId) === "google.com" && str(p.uid),
    );

    user = await prisma.user.create({
      data: {
        legacyUid: uid,
        email,
        name: str(prof.displayName) ?? str(a.displayName),
        image: str(a.photoURL),
        emailVerified: a.emailVerified === true ? toDate(a.createdAt) : null,
        role: adminEmails.includes(email) ? "ADMIN" : "USER",
        phone: str(prof.phone),
        city: str(prof.city),
        country: str(prof.country),
        streetAddress: str(prof.streetAddress),
        currency: str(prof.currency) === "GHS" ? "GHS" : "USD",
        createdAt: toDate(prof.createdAt ?? a.createdAt),
        accounts: {
          create: googleProviders.map((p) => ({
            type: "oidc",
            provider: "google",
            providerAccountId: str(p.uid)!, // Firebase's Google providerData uid is Google's account id
          })),
        },
      },
      select: { id: true, legacyUid: true },
    });
    t.ok++;
  }
}

async function userIdMap() {
  const users = await prisma.user.findMany({
    where: { legacyUid: { not: null } },
    select: { id: true, legacyUid: true },
  });
  return new Map(users.map((u) => [u.legacyUid!, u.id]));
}

async function importOrders(uidToId: Map<string, string>) {
  const t = track("orders");
  const fx = Number(process.env.NEXT_PUBLIC_USD_TO_GHS ?? "15");

  for (const o of load("orders")) {
    const legacyId = str(o.id);
    const orderNumber = str(o.orderNumber) ?? legacyId;
    const userId = uidToId.get(str(o.userId) ?? "");
    const status = STATUS[str(o.status) ?? ""];
    if (!legacyId || !orderNumber || !userId || !status) {
      t.skipped.push(
        `${legacyId ?? "(no id)"} (${!userId ? "unknown user" : "missing fields"})`,
      );
      continue;
    }
    if (
      await prisma.order.findFirst({
        where: { OR: [{ id: legacyId }, { orderNumber }] },
        select: { id: true },
      })
    ) {
      t.skipped.push(`${orderNumber} (exists)`);
      continue;
    }

    const rawItems = Array.isArray(o.items) ? o.items.filter(isRec) : [];
    const productIds = new Set(
      (await prisma.product.findMany({ select: { id: true } })).map(
        (p) => p.id,
      ),
    );
    const items = rawItems.map((it) => {
      const productId = str(it.productId) ?? str(it.id);
      return {
        productId: productId && productIds.has(productId) ? productId : null,
        title: str(it.title) ?? str(it.name) ?? "Item",
        designer: str(it.designer) ?? "",
        size: str(it.size) ?? "One Size",
        quantity: Math.max(1, int(it.quantity ?? it.qty)),
        unitPriceUsdCents: cents(it.priceUsd ?? it.price),
        imageUrl: str(it.imageUrl) ?? str(it.image),
      };
    });

    const last4 = str(o.paymentLast4)?.slice(-4) ?? null;
    await prisma.order.create({
      data: {
        id: legacyId,
        orderNumber,
        userId,
        customerName: str(o.customerName) ?? "Customer",
        customerEmail: str(o.customerEmail) ?? "unknown@example.com",
        phone: str(o.phone) ?? "",
        shippingCity: str(o.shippingCity) ?? "",
        shippingCountry: str(o.shippingCountry) ?? "",
        shippingAddress: str(o.shippingAddress) ?? "",
        deliveryMethod: (DELIVERY[str(o.deliveryMethod) ?? ""] ??
          "DHL_EXPRESS_DDP") as never,
        paymentMethod: (PAYMENT[str(o.paymentMethod) ?? ""] ?? "CARD") as never,
        paymentLast4: last4 && last4.length === 4 ? last4 : null,
        // Legacy orders count as paid so the unpaid-order expiry job never touches them
        paymentStatus: status === "CANCELLED" ? "UNPAID" : "PAID",
        currency: str(o.currency) === "GHS" ? "GHS" : "USD",
        fxRate: fx,
        promoCode: str(o.promoCode),
        discountUsdCents: cents(o.discountUsd),
        subtotalUsdCents: cents(o.subtotalUsd),
        shippingUsdCents: cents(o.shippingUsd),
        dutiesUsdCents: cents(o.dutiesUsd),
        totalUsdCents: cents(o.totalUsd),
        status: status as never,
        createdAt: toDate(o.createdAt),
        updatedAt: toDate(o.updatedAt),
        items: { create: items },
      },
    });
    t.ok++;
  }
}

async function importWishlist(uidToId: Map<string, string>) {
  const t = track("wishlist");
  const productIds = new Set(
    (await prisma.product.findMany({ select: { id: true } })).map((p) => p.id),
  );
  const data = load("wishlist").flatMap((w) => {
    const userId = uidToId.get(str(w.userId) ?? "");
    const productId = str(w.productId);
    if (!userId || !productId || !productIds.has(productId)) {
      t.skipped.push(`${str(w.userId)}:${productId}`);
      return [];
    }
    return [{ userId, productId, createdAt: toDate(w.createdAt) }];
  });
  const r = await prisma.wishlistItem.createMany({
    data,
    skipDuplicates: true,
  });
  t.ok += r.count;
}

async function importSubscribers(uidToId: Map<string, string>) {
  const t = track("subscribers");
  const data = load("subscribers").flatMap((s) => {
    const email = str(s.email)?.toLowerCase();
    if (!email) {
      t.skipped.push(str(s.id) ?? "(no id)");
      return [];
    }
    const pref = str(s.departmentPreference)?.toUpperCase();
    return [
      {
        email,
        departmentPreference: (pref === "WOMEN" ||
        pref === "MEN" ||
        pref === "ALL"
          ? pref
          : null) as never,
        status: (str(s.status) === "unsubscribed"
          ? "UNSUBSCRIBED"
          : "ACTIVE") as never,
        source: str(s.source) ?? "import",
        userId: uidToId.get(str(s.userId) ?? "") ?? null,
        createdAt: toDate(s.createdAt),
      },
    ];
  });
  const r = await prisma.subscriber.createMany({ data, skipDuplicates: true });
  t.ok += r.count;
}

async function importRestockAlerts(uidToId: Map<string, string>) {
  const t = track("restockAlerts");
  const productIds = new Set(
    (await prisma.product.findMany({ select: { id: true } })).map((p) => p.id),
  );
  const data = load("restockAlerts").flatMap((a) => {
    const productId = str(a.productId);
    const email = str(a.email)?.toLowerCase();
    const size = str(a.size);
    if (!productId || !productIds.has(productId) || !email || !size) {
      t.skipped.push(str(a.id) ?? "(no id)");
      return [];
    }
    return [
      {
        productId,
        size,
        email,
        productTitle: str(a.productTitle) ?? "",
        designer: str(a.designer) ?? "",
        userId: uidToId.get(str(a.userId) ?? "") ?? null,
        status: (str(a.status) === "notified"
          ? "NOTIFIED"
          : "PENDING") as never,
        createdAt: toDate(a.createdAt),
      },
    ];
  });
  const r = await prisma.restockAlert.createMany({
    data,
    skipDuplicates: true,
  });
  t.ok += r.count;
}

async function main() {
  console.log(`Importing from ${dir}${skipImages ? " (skipping images)" : ""}`);
  await importProducts();
  await importUsers();
  const map = await userIdMap();
  await importOrders(map);
  await importWishlist(map);
  await importSubscribers(map);
  await importRestockAlerts(map);

  console.log("\nSummary");
  for (const [k, v] of Object.entries(report)) {
    console.log(`  ${k}: ${v.ok} imported, ${v.skipped.length} skipped`);
    for (const s of v.skipped.slice(0, 10)) console.log(`     - ${s}`);
    if (v.skipped.length > 10)
      console.log(`     … and ${v.skipped.length - 10} more`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
