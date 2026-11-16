import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function deleteCloudinaryImages(publicIds: string[]) {
  if (publicIds.length === 0) return;
  await cloudinary.api.delete_resources(publicIds, {
    resource_type: "image",
    invalidate: true,
  });
}
