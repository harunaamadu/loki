import { config } from "dotenv";
import { Client } from "pg";

config({ path: ".env.local" });
config(); // .env

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

async function main() {
  const u = new URL(url!);
  console.log(`DATABASE_URL -> ${u.hostname}:${u.port || 5432}${u.pathname}`);
  const direct = process.env.DIRECT_URL;
  if (direct && direct !== url)
    console.log(
      "WARNING: DIRECT_URL differs from DATABASE_URL (migrations target a different DB)",
    );

  const db = new Client({ connectionString: url });
  await db.connect();

  const tables = await db.query(
    `select table_name from information_schema.tables where table_schema = 'public' order by 1`,
  );
  console.log(
    "\nTables:",
    tables.rows.map((r) => r.table_name).join(", ") || "(none)",
  );

  if (tables.rows.some((r) => r.table_name === "Product")) {
    const cols = await db.query(
      `select column_name from information_schema.columns where table_schema = 'public' and table_name = 'Product' order by ordinal_position`,
    );
    console.log(
      "\nProduct columns:",
      cols.rows.map((r) => r.column_name).join(", "),
    );
    const vals = await db.query(
      `select distinct department::text as d, condition::text as c from "Product"`,
    );
    console.log(
      "\nDepartment/condition values in data:",
      JSON.stringify(vals.rows),
    );
  }

  try {
    const m = await db.query(
      `select migration_name, finished_at is not null as done from _prisma_migrations order by started_at`,
    );
    console.log("\nMigrations:");
    for (const r of m.rows)
      console.log(`  ${r.done ? "applied" : "FAILED "}  ${r.migration_name}`);
  } catch {
    console.log(
      "\nNo _prisma_migrations table: migrations have never been run on this database.",
    );
  }
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
