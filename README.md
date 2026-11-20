# Loki

Luxury fashion storefront: browse designers and boutiques, bag items, check out with Paystack, and manage the catalog, orders and reviews from an admin area.

**Stack:** Next.js 16 (App Router) · React 19 · Prisma 7 + PostgreSQL · Auth.js (Google + credentials) · Cloudinary · Paystack · Resend · Tailwind CSS 4 + shadcn/ui · Zustand · Framer Motion / GSAP

## Local setup

```bash
npm install
cp .env.example .env          # then fill in the values
npx prisma migrate dev --config prisma7.config.ts
npm run db:seed               # optional: sample catalog + an admin user
npm run dev
```

Open <http://localhost:3000>. Every variable is documented in [`.env.example`](.env.example).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate Next route types, then `tsc --noEmit` |
| `npm run db:seed` | Seed the catalog and the admin user |
| `npm run db:seed:cloudinary` | Link seeded products to images already in Cloudinary |
| `npx tsx scripts/db-check.ts` | Check the database connection and migration state |

`scripts/export-firestore.ts` and `scripts/import-firestore.ts` are one-off tools for the earlier Firebase -> Postgres migration. They write customer data and need a service-account key; both paths are git-ignored.

## Deploying (Vercel)

1. Import the repo and set every variable from `.env.example` in **Project Settings -> Environment Variables**. Set `AUTH_URL` to the production URL and generate a new `AUTH_SECRET`.
2. `postinstall` runs `prisma generate`, so no extra build step is needed for the client.
3. Apply migrations to the production database before the first release and after any schema change:
   ```bash
   DATABASE_URL="<production url>" npx prisma migrate deploy --config prisma7.config.ts
   ```
4. Set the Paystack webhook URL to `https://<your-domain>/api/paystack/webhook`.
5. In Google Cloud, add `https://<your-domain>/api/auth/callback/google` as an authorized redirect URI.
6. `vercel.json` registers a cron that calls `/api/cron/expire-orders` every 10 minutes. It needs `CRON_SECRET` to be set, and sub-daily schedules require a Vercel Pro plan.
7. If you seed production, set `SEED_ADMIN_EMAIL` and a strong `SEED_ADMIN_PASSWORD` first. The fallback password is only meant for local development.

## Project layout

See [`doc/file_structure.md`](doc/file_structure.md).
