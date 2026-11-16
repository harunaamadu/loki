"use client";

import { CldImage, CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { CloudinaryLibraryPicker } from "@/components/admin/cloudinary-library-picker";
import type { UploadedImage } from "@/lib/types";

export type { UploadedImage } from "@/lib/types";

interface Props {
  images: UploadedImage[];
  onAdd: (image: UploadedImage) => void;
  onRemove: (publicId: string) => void;
  onMakeMain?: (publicId: string) => void;
}

export function ImageUploader({ images, onAdd, onRemove, onMakeMain }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.publicId} className="space-y-1">
            <div className="relative border">
              <CldImage
                src={img.publicId}
                width={300}
                height={300}
                crop="fill"
                gravity="auto"
                alt="Product image"
                className="aspect-square w-full object-cover"
              />
              {i === 0 && (
                <span className="absolute left-1 top-1 bg-foreground px-1.5 py-0.5 text-[10px] uppercase text-background">
                  Main
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {i > 0 && onMakeMain && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onMakeMain(img.publicId)}
                >
                  Make main
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onRemove(img.publicId)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <CloudinaryLibraryPicker
          selected={images.map((i) => i.publicId)}
          onAdd={onAdd}
          onRemove={onRemove}
        />

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
              Upload new
            </Button>
          )}
        </CldUploadWidget>
      </div>
      <p className="text-xs text-muted-foreground">
        The first image is the main one shown on cards. The second appears on
        hover.
      </p>
    </div>
  );
}
