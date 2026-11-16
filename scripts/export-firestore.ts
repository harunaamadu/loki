import "dotenv/config";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { cert, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Usage: npx tsx scripts/export-firestore.ts ./serviceAccount.json ./firestore-export

const keyPath = process.argv[2];
const outDir = process.argv[3] ?? "./firestore-export";
if (!keyPath) {
  console.error(
    "Usage: tsx scripts/export-firestore.ts <serviceAccount.json> [outDir]",
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(
  readFileSync(keyPath, "utf8"),
) as ServiceAccount;
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const auth = getAuth(app);

function plain(v: unknown): unknown {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, x]) => [
        k,
        plain(x),
      ]),
    );
  }
  return v;
}

function write(name: string, data: unknown) {
  writeFileSync(
    path.join(outDir, `${name}.json`),
    JSON.stringify(data, null, 2),
  );
  console.log(`${name}.json: ${Array.isArray(data) ? data.length : 0} records`);
}

async function collection(name: string) {
  const snap = await db.collection(name).get();
  return snap.docs.map((d) => ({
    id: d.id,
    ...(plain(d.data()) as Record<string, unknown>),
  }));
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  write("products", await collection("products"));
  write("users", await collection("users"));
  write("orders", await collection("orders"));
  write("restockAlerts", await collection("restockAlerts"));
  write("subscribers", await collection("subscribers"));

  const wl = await db.collectionGroup("wishlist").get();
  write(
    "wishlist",
    wl.docs.flatMap((d) => {
      const userId = d.ref.parent.parent?.id;
      const productId = (d.data().productId as string | undefined) ?? d.id;
      return userId
        ? [{ userId, productId, createdAt: plain(d.data().createdAt) ?? null }]
        : [];
    }),
  );

  const authUsers = [];
  let token: string | undefined;
  do {
    const page = await auth.listUsers(1000, token);
    for (const u of page.users) {
      authUsers.push({
        uid: u.uid,
        email: u.email ?? null,
        emailVerified: u.emailVerified,
        displayName: u.displayName ?? null,
        photoURL: u.photoURL ?? null,
        createdAt: u.metadata.creationTime,
        providers: u.providerData.map((p) => ({
          providerId: p.providerId,
          uid: p.uid,
        })),
      });
    }
    token = page.pageToken;
  } while (token);
  write("auth-users", authUsers);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
