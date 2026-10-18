export const PRODUCT_PRICE_EGP: number;
export const SHIPPING_FEE_EGP: number;
export const MAX_QUANTITY: number;
export const VALID_SIZES: string[];
export function normalizeEgyptianPhone(value: unknown): string | null;
export function calculateTotals(items: { quantity: number }[]): {
  totalQuantity: number;
  subtotalEGP: number;
  shippingFeeEGP: number;
  codAmountEGP: number;
};
export function formatEGP(value: number): string;

