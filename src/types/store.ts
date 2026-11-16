export type Department = "Women" | "Men" | "Kids";

export type Category =
  | "Clothing"
  | "Bags"
  | "Shoes"
  | "Jewelry"
  | "Accessories";

export type Condition = "New Season" | "Conscious" | "Pre-Owned";

export type Currency = "USD" | "GHS";

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "discount-desc";

export type DeliveryMethod = "DHL Express DDP" | "Atelier Priority Courier";

export type PaymentMethod =
  | "Card"
  | "MTN Mobile Money"
  | "Telecel Cash"
  | "Apple Pay";

export type OrderStatus =
  | "Order Placed"
  | "Boutique Authentication"
  | "In Transit via DHL"
  | "Delivered"
  | "Cancelled";

export type ShoppingSection =
  | "women"
  | "men"
  | "kids"
  | "pre-owned"
  | "sale"
  | "all";

export type AppRoute =
  | { page: "home" }
  | { page: "shopping"; section: ShoppingSection }
  | { page: "product"; productId: string }
  | { page: "designers" }
  | { page: "boutiques" }
  | { page: "bag" }
  | { page: "checkout" }
  | { page: "wishlist" }
  | { page: "account"; tab: "orders" | "wishlist" | "profile" }
  | { page: "info"; slug: string }
  | { page: "not-found" };

export interface Product {
  id: string;
  department: Department;
  designer: string;
  title: string;
  category: Category;
  subcategory: string;
  priceUsd: number;
  originalPriceUsd?: number;
  color: string;
  material: string;
  condition: Condition;
  boutique: string;
  imageUrl: string;
  description: string;
  totalStock: number;
  sizeStock: Record<string, number>;
  isNewArrival?: boolean;
}

export interface BagItem {
  id: string;
  productId: string;
  size: string;
  quantity: number;
}

export interface FilterState {
  search: string;
  department: Department | "All";
  category: Category | "All";
  designers: string[];
  sizes: string[];
  colors: string[];
  conditions: Condition[];
  boutique: string;
  saleOnly: boolean;
  priceRange: "all" | "under-1000" | "1000-2500" | "over-2500";
  inStockOnly: boolean;
  sortBy: SortOption;
}

export interface OrderLineItem {
  productId: string;
  designer: string;
  title: string;
  imageUrl: string;
  size: string;
  quantity: number;
  unitPriceUsd: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingCity: string;
  shippingCountry: string;
  shippingAddress: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentLast4: string;
  currency: Currency;
  promoCode?: string;
  discountUsd?: number;
  subtotalUsd: number;
  shippingUsd: number;
  dutiesUsd: number;
  totalUsd: number;
  status: OrderStatus;
  items: OrderLineItem[];
  createdAtIso: string;
  updatedAtIso: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  streetAddress: string;
  currency: Currency;
}

export interface CheckoutFormInput {
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingCountry: string;
  shippingCity: string;
  shippingAddress: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  momoPhone?: string;
}

export interface PartnerBoutique {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  foundedYear: number;
  specialty: string;
  description: string;
}

export interface RestockAlert {
  id: string;
  productId: string;
  productTitle: string;
  designer: string;
  size: string;
  email: string;
  userId?: string;
  status: "pending" | "notified";
  createdAtIso: string;
}

export type NewsletterPreference = "Women" | "Men" | "All";

export interface NewsletterSubscription {
  id: string;
  email: string;
  departmentPreference: NewsletterPreference;
  status: "active" | "unsubscribed";
  source: "footer";
  userId?: string;
  createdAtIso: string;
}
