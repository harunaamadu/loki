import { z } from "zod";
import {
  CATEGORIES,
  CONDITIONS,
  CURRENCIES,
  DELIVERY_METHODS,
  DEPARTMENTS,
  PAYMENT_METHODS,
  PREFERENCES,
} from "@/lib/labels";

import { REVIEW_BODY_MAX, REVIEW_BODY_MIN, REVIEW_SORTS, REVIEW_TITLE_MAX } from "@/lib/reviews";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const idString = z.string().min(1).max(64).regex(ID_REGEX, "Invalid id.");
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(160)
  .pipe(z.email("Enter a valid email."));
const passwordField = z.string().min(8, "Use at least 8 characters.").max(72);

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required.").max(200),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  email: emailField,
  password: passwordField,
});

export const forgotSchema = z.object({ email: emailField });

export const resetSchema = z.object({
  email: emailField,
  token: z.string().min(32).max(128),
  password: passwordField,
});

export const imageSchema = z.object({
  publicId: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[\w\-./ ]+$/, "Invalid image id."),
  url: z
    .url()
    .max(500)
    .refine(
      (u) =>
        !cloudName || u.startsWith(`https://res.cloudinary.com/${cloudName}/`),
      "Image must be hosted on our Cloudinary account.",
    ),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

const optText = (max: number) => z.string().trim().min(1).max(max).nullable();

const productBase = z.object({
  id: z.string().min(2).max(64).regex(ID_REGEX).optional(),
  department: z.enum(DEPARTMENTS).nullable(),
  designer: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(140),
  category: z.enum(CATEGORIES),
  subcategory: optText(60),
  priceUsdCents: z.number().int().min(1).max(100_000_000),
  originalPriceUsdCents: z.number().int().min(1).max(100_000_000).nullable(),
  color: optText(40),
  material: optText(120),
  condition: z.enum(CONDITIONS),
  boutique: optText(100),
  sizes: z
    .array(
      z.object({
        size: z.string().trim().min(1).max(24),
        stock: z.number().int().min(0).max(10_000),
      }),
    )
    .min(1)
    .max(20),
  images: z.array(imageSchema).max(8),
});

type ProductCheck = {
  sizes: { size: string; stock: number }[];
  priceUsdCents: number;
  originalPriceUsdCents: number | null;
};
type Ctx = { addIssue: (i: { code: "custom"; message: string }) => void };

function check(d: ProductCheck, ctx: Ctx) {
  if (
    d.originalPriceUsdCents !== null &&
    d.originalPriceUsdCents < d.priceUsdCents
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Original price must be at least the current price.",
    });
  }
  if (new Set(d.sizes.map((s) => s.size)).size !== d.sizes.length) {
    ctx.addIssue({ code: "custom", message: "Sizes must be unique." });
  }
  if (d.sizes.reduce((n, s) => n + s.stock, 0) > 10_000) {
    ctx.addIssue({
      code: "custom",
      message: "Total stock cannot exceed 10,000.",
    });
  }
}

export const productSchema = productBase.superRefine(check);
export const productUpdateSchema = productBase
  .omit({ id: true })
  .superRefine(check);

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(32).nullable(),
  city: z.string().trim().max(80).nullable(),
  country: z.string().trim().max(80).nullable(),
  streetAddress: z.string().trim().max(200).nullable(),
  currency: z.enum(CURRENCIES),
});

export const bagSchema = z.object({
  productId: idString,
  size: z.string().trim().min(1).max(24),
  quantity: z.number().int().min(0).max(10), // 0 removes the line
});

export const checkoutSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: idString,
          size: z.string().trim().min(1).max(24),
          quantity: z.number().int().min(1).max(10),
        }),
      )
      .min(1)
      .max(20),
    customerName: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(6).max(32),
    shippingCity: z.string().trim().min(2).max(80),
    shippingCountry: z.string().trim().min(2).max(80),
    shippingAddress: z.string().trim().min(4).max(240),
    deliveryMethod: z.enum(DELIVERY_METHODS),
    paymentMethod: z.enum(PAYMENT_METHODS),
    currency: z.enum(CURRENCIES),
    promoCode: z.string().trim().max(32).optional(),
  })
  .superRefine((d, ctx) => {
    const momo =
      d.paymentMethod === "MTN_MOBILE_MONEY" ||
      d.paymentMethod === "TELECEL_CASH";
    if (momo && d.currency !== "GHS") {
      ctx.addIssue({
        code: "custom",
        message: "Mobile money payments are charged in GHS.",
        path: ["currency"],
      });
    }
  });

export const restockSchema = z.object({
  productId: idString,
  size: z.string().trim().min(1).max(24),
  email: emailField,
});

export const newsletterSchema = z.object({
  email: emailField,
  departmentPreference: z.enum(PREFERENCES).nullable(),
  source: z.string().trim().min(1).max(32),
});

export const removeBagItemsSchema = z
  .array(
    z.object({ productId: idString, size: z.string().trim().min(1).max(24) }),
  )
  .min(1, "Select at least one item.")
  .max(20);

const LINK_RE = /(https?:\/\/|www\.)/i;
const noLinks = (s: string) => !LINK_RE.test(s);

export const reviewSchema = z.object({
  productId: idString,
  rating: z.number().int().min(1, "Please choose a star rating.").max(5),
  title: z
    .string()
    .trim()
    .max(REVIEW_TITLE_MAX)
    .refine(noLinks, "Links aren't allowed in reviews.")
    .nullable(),
  body: z
    .string()
    .trim()
    .min(REVIEW_BODY_MIN, `Please write at least ${REVIEW_BODY_MIN} characters.`)
    .max(REVIEW_BODY_MAX, `Reviews can be up to ${REVIEW_BODY_MAX} characters.`)
    .refine(noLinks, "Links aren't allowed in reviews.")
    .transform((s) => s.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n")),
});

export const loadReviewsSchema = z.object({
  productId: idString,
  sort: z.enum(REVIEW_SORTS),
  page: z.number().int().min(0).max(100),
});