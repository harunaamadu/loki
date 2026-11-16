export interface SizeStock {
  size: string;
  stock: number;
}

export interface UploadedImage {
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface ProductListItem {
  id: string;
  department: string | null; // enum key, e.g. "WOMEN"
  designer: string;
  title: string;
  category: string;
  condition: string;
  priceUsdCents: number;
  originalPriceUsdCents: number | null;
  imagePublicId: string | null;
  secondImagePublicId: string | null;
  sizes: SizeStock[];
  totalStock: number;
}

export interface ProductDetail extends ProductListItem {
  subcategory: string | null;
  color: string | null;
  material: string | null;
  boutique: string | null;
  imagePublicIds: string[];
}

export interface BagLine {
  productId: string;
  size: string;
  quantity: number;
  title: string;
  designer: string;
  priceUsdCents: number;
  imagePublicId: string | null;
  stock: number;
}