export const DEPARTMENTS = ["WOMEN", "MEN", "KIDS"] as const;
export const CATEGORIES = [
  "CLOTHING",
  "BAGS",
  "SHOES",
  "JEWELRY",
  "ACCESSORIES",
] as const;
export const CONDITIONS = ["NEW_SEASON", "CONSCIOUS", "PRE_OWNED"] as const;
export const DELIVERY_METHODS = [
  "DHL_EXPRESS_DDP",
  "ATELIER_PRIORITY_COURIER",
] as const;
export const PAYMENT_METHODS = [
  "CARD",
  "MTN_MOBILE_MONEY",
  "TELECEL_CASH",
  "APPLE_PAY",
] as const;
export const ORDER_STATUSES = [
  "ORDER_PLACED",
  "BOUTIQUE_AUTHENTICATION",
  "IN_TRANSIT_DHL",
  "DELIVERED",
  "CANCELLED",
] as const;
export const CURRENCIES = ["USD", "GHS"] as const;
export const PREFERENCES = ["WOMEN", "MEN", "ALL"] as const;

export type DepartmentKey = (typeof DEPARTMENTS)[number];
export type CategoryKey = (typeof CATEGORIES)[number];
export type ConditionKey = (typeof CONDITIONS)[number];
export type DeliveryKey = (typeof DELIVERY_METHODS)[number];
export type PaymentKey = (typeof PAYMENT_METHODS)[number];
export type OrderStatusKey = (typeof ORDER_STATUSES)[number];
export type CurrencyKey = (typeof CURRENCIES)[number];

export const DEPARTMENT_LABEL: Record<DepartmentKey, string> = {
  WOMEN: "Women",
  MEN: "Men",
  KIDS: "Kids",
};
export const CATEGORY_LABEL: Record<CategoryKey, string> = {
  CLOTHING: "Clothing",
  BAGS: "Bags",
  SHOES: "Shoes",
  JEWELRY: "Jewelry",
  ACCESSORIES: "Accessories",
};
export const CONDITION_LABEL: Record<ConditionKey, string> = {
  NEW_SEASON: "New Season",
  CONSCIOUS: "Conscious",
  PRE_OWNED: "Pre-Owned",
};
export const DELIVERY_LABEL: Record<DeliveryKey, string> = {
  DHL_EXPRESS_DDP: "DHL Express DDP",
  ATELIER_PRIORITY_COURIER: "Atelier Priority Courier",
};
export const PAYMENT_LABEL: Record<PaymentKey, string> = {
  CARD: "Card",
  MTN_MOBILE_MONEY: "MTN Mobile Money",
  TELECEL_CASH: "Telecel Cash",
  APPLE_PAY: "Apple Pay",
};
export const ORDER_STATUS_LABEL: Record<OrderStatusKey, string> = {
  ORDER_PLACED: "Order Placed",
  BOUTIQUE_AUTHENTICATION: "Boutique Authentication",
  IN_TRANSIT_DHL: "In Transit via DHL",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

/** Shipment tracking steps shown on the order page */
export const ORDER_STEPS: OrderStatusKey[] = [
  "ORDER_PLACED",
  "BOUTIQUE_AUTHENTICATION",
  "IN_TRANSIT_DHL",
  "DELIVERED",
];

/** Allowed admin transitions. DELIVERED and CANCELLED are terminal. */
export const NEXT_STATUSES: Record<OrderStatusKey, OrderStatusKey[]> = {
  ORDER_PLACED: ["BOUTIQUE_AUTHENTICATION", "CANCELLED"],
  BOUTIQUE_AUTHENTICATION: ["IN_TRANSIT_DHL", "CANCELLED"],
  IN_TRANSIT_DHL: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
