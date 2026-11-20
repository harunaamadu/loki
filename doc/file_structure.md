loki/
 ├─ prisma/
 │  ├─ schema.prisma
-│  └─ seed.ts
-├─ prisma.config.ts
-├─ next.config.ts
-├─ .env.example
+│  ├─ migrations/            SQL migrations (apply with `prisma migrate deploy`)
+│  ├─ seed.ts                admin user + catalog
+│  └─ seed-data/
+├─ scripts/                  one-off CLI tools (db check, Cloudinary, Firestore migration)
+├─ prisma7.config.ts         Prisma CLI config (schema, migrations, seed)
+├─ next.config.ts            security headers, image hosts
+├─ vercel.json               cron: /api/cron/expire-orders
+├─ .env.example              every environment variable the app reads
 └─ src/
-   ├─ proxy.ts
-   ├─ auth.ts
-   ├─ auth.config.ts
-   ├─ types/next-auth.d.ts
-   ├─ generated/prisma/              (generated, git-ignored)
+   ├─ proxy.ts               route protection (Next "proxy", formerly middleware)
+   ├─ auth.ts                Auth.js instance (adapter, providers)
+   ├─ auth.config.ts         edge-safe Auth.js config + `authorized` rules
+   ├─ actions/               server actions (auth, bag, order, product, review, ...)
    ├─ app/
-   │  ├─ globals.css
-   │  ├─ layout.tsx
-   │  ├─ template.tsx
-   │  ├─ page.tsx
-   │  ├─ shop/page.tsx
-   │  ├─ product/[slug]/page.tsx
-   │  ├─ login/page.tsx
-   │  ├─ register/page.tsx
-   │  ├─ checkout/page.tsx
-   │  ├─ orders/[id]/page.tsx
-   │  ├─ admin/products/new/page.tsx
-   │  └─ api/
-   │     ├─ auth/[...nextauth]/route.ts
-   │     └─ cloudinary/sign/route.ts
-   ├─ actions/
-   │  ├─ auth.ts
-   │  ├─ product.ts
-   │  └─ order.ts
-   ├─ components/
-   │  ├─ providers.tsx
-   │  ├─ header.tsx
-   │  ├─ cart-button.tsx
-   │  ├─ cart-drawer.tsx
-   │  ├─ hero.tsx
-   │  ├─ product-card.tsx
-   │  ├─ add-to-cart-button.tsx
-   │  ├─ shop-client.tsx
-   │  ├─ checkout-form.tsx
-   │  ├─ auth-forms.tsx
-   │  └─ admin/
-   │     ├─ image-uploader.tsx
-   │     └─ product-form.tsx
-   ├─ lib/
-   │  ├─ prisma.ts
-   │  ├─ cloudinary.ts
-   │  ├─ utils.ts
-   │  ├─ types.ts
-   │  ├─ action.ts
-   │  ├─ guards.ts
-   │  ├─ validations.ts
-   │  └─ queries.ts
-   └─ store/
-      ├─ cart-store.ts
-      ├─ ui-store.ts
-      ├─ filter-store.ts
-      └─ use-hydrated.ts
\ No newline at end of file
+   │  ├─ (auth)/             login, register, forgot/reset password
+   │  ├─ (shop)/             shop, product, boutiques, designers, account, checkout, orders, wishlist
+   │  ├─ admin/              orders, products, reviews, restock alerts, subscribers
+   │  ├─ api/                auth, cloudinary, cron, paystack webhook, verify-email, admin exports
+   │  └─ icons/              generated app icons
+   ├─ components/            account, admin, auth, bag, checkout, home, layout, orders,
+   │                         product, reviews, shared, shop, ui (shadcn)
+   ├─ config/                nav, footer links, hero, departments, store settings
+   ├─ hooks/
+   ├─ lib/                   prisma client, payments, pricing, email, guards, validations, ...
+   ├─ store/                 Zustand stores (bag, filters, UI, recently viewed)
+   └─ generated/prisma/      generated Prisma client (git-ignored)