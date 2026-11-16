import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email.")),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short.").max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email.")),
  password: z.string().min(8, "Use at least 8 characters.").max(72),
});

export const imageSchema = z.object({
  publicId: z.string().min(1).startsWith("loki/"),
  url: z.url(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(140),
  description: z.string().trim().min(1).max(5000),
  priceCents: z.number().int().min(0).max(100_000_000),
  compareAtPriceCents: z.number().int().min(0).nullable(),
  stock: z.number().int().min(0).max(1_000_000),
  categoryId: z.string().min(1),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  images: z.array(imageSchema).max(8),
});
export type ProductInput = z.infer<typeof productSchema>;

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
  shipping: z.object({
    fullName: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(6).max(30),
    line1: z.string().trim().min(3).max(200),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(2).max(100),
    region: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().max(20).optional(),
    country: z.string().trim().min(2).max(100),
  }),
  notes: z.string().trim().max(500).optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
