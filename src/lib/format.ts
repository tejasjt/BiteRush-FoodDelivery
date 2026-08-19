export const DELIVERY_FEE = 39;
export const FREE_DELIVERY_ABOVE = 499;

export function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function deliveryFeeFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
}

export function discountedPrice(price: number, offerPercent: number): number {
  if (!offerPercent) return price;
  return Math.round(price - (price * offerPercent) / 100);
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  placed: "Order Placed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_FLOW = ["placed", "preparing", "out_for_delivery", "delivered"] as const;

export function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}