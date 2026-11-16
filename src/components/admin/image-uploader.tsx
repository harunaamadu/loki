"use client";

import { CldImage, CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";

export interface UploadedImage {
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
}

interface Props {
  images: UploadedImage[];
  onAdd: (image: UploadedImage) => void;
  onRemove: (publicId: string) => void;
}

export function ImageUploader({ images, onAdd, onRemove }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.publicId} className="relative border">
            <CldImage
              src={img.publicId}
              width={300}
              height={300}
              crop="fill"
              gravity="auto"
              alt="Product image"
              className="aspect-square w-full object-cover"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute right-1 top-1"
              onClick={() => onRemove(img.publicId)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <CldUploadWidget
        signatureEndpoint="/api/cloudinary/sign"
        options={{
          folder: "loki/products",
          multiple: true,
          maxFiles: 8,
          resourceType: "image",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
          maxFileSize: 5_000_000,
        }}
        onSuccess={(result) => {
          const info = result?.info;
          if (!info || typeof info === "string") return;
          onAdd({
            publicId: info.public_id,
            url: info.secure_url,
            width: info.width ?? null,
            height: info.height ?? null,
          });
        }}
      >
        {({ open }) => (
          <Button type="button" variant="outline" onClick={() => open()}>
            Upload images
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
}
