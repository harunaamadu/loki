export { cn } from "cn";

export function formatPrice(
  cents: number,
  currency = process.env.NEXT_PUBLIC_CURRENCY ?? "USD",
) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(
    cents / 100,
  );
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Only allow same-site relative redirects (prevents open-redirect abuse). */
export function safeRedirect(
  value: FormDataEntryValue | null | undefined,
  fallback = "/",
) {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return fallback;
  return value;
}
