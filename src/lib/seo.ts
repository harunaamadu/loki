export const siteUrl = () =>
  (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Delivery URL for a Cloudinary image with a transformation, used for share images and structured data. */
export function cloudinaryImageUrl(
  publicId: string,
  transform = "c_fill,g_auto,w_1200,h_1500,f_auto,q_auto",
) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return null;
  const path = publicId.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${cloud}/image/upload/${transform}/${path}`;
}

/** Serialises JSON-LD safely for a <script> tag (a "<" can never close the tag). */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
