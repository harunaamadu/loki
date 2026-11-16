loki/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ next.config.ts
├─ .env.example
└─ src/
   ├─ proxy.ts
   ├─ auth.ts
   ├─ auth.config.ts
   ├─ types/next-auth.d.ts
   ├─ generated/prisma/              (generated, git-ignored)
   ├─ app/
   │  ├─ globals.css
   │  ├─ layout.tsx
   │  ├─ template.tsx
   │  ├─ page.tsx
   │  ├─ shop/page.tsx
   │  ├─ product/[slug]/page.tsx
   │  ├─ login/page.tsx
   │  ├─ register/page.tsx
   │  ├─ checkout/page.tsx
   │  ├─ orders/[id]/page.tsx
   │  ├─ admin/products/new/page.tsx
   │  └─ api/
   │     ├─ auth/[...nextauth]/route.ts
   │     └─ cloudinary/sign/route.ts
   ├─ actions/
   │  ├─ auth.ts
   │  ├─ product.ts
   │  └─ order.ts
   ├─ components/
   │  ├─ providers.tsx
   │  ├─ header.tsx
   │  ├─ cart-button.tsx
   │  ├─ cart-drawer.tsx
   │  ├─ hero.tsx
   │  ├─ product-card.tsx
   │  ├─ add-to-cart-button.tsx
   │  ├─ shop-client.tsx
   │  ├─ checkout-form.tsx
   │  ├─ auth-forms.tsx
   │  └─ admin/
   │     ├─ image-uploader.tsx
   │     └─ product-form.tsx
   ├─ lib/
   │  ├─ prisma.ts
   │  ├─ cloudinary.ts
   │  ├─ utils.ts
   │  ├─ types.ts
   │  ├─ action.ts
   │  ├─ guards.ts
   │  ├─ validations.ts
   │  └─ queries.ts
   └─ store/
      ├─ cart-store.ts
      ├─ ui-store.ts
      ├─ filter-store.ts
      └─ use-hydrated.ts