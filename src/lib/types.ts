export interface ProductImageDTO {
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stock: number;
  categorySlug: string;
  categoryName: string;
  image: ProductImageDTO | null;
}
