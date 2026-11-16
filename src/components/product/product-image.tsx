import { CldImage } from "next-cloudinary";
import { cn } from "@/lib/utils";

interface Props {
  publicId: string | null;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function ProductImage({
  publicId,
  alt,
  width = 800,
  height = 1000,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
  className,
}: Props) {
  if (!publicId) {
    return (
      <div
        role="img"
        aria-label={alt || "No image"}
        className={cn(
          "flex h-full w-full items-center justify-center bg-secondary text-4xl font-light text-muted-foreground",
          className,
        )}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <CldImage
      src={publicId}
      width={width}
      height={height}
      crop="fill"
      gravity="auto"
      sizes={sizes}
      alt={alt}
      priority={priority}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
