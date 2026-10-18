export const PRODUCT_PRICE_EGP = 1499;
export const SHIPPING_FEE_EGP = 100;
export const MAX_QUANTITY = 10;
export const VALID_SIZES = ["S", "M", "L", "XL"];

export function normalizeEgyptianPhone(value) {
  const compact = String(value ?? "").replace(/[\s-]/g, "");
  if (/^01[0125]\d{8}$/.test(compact)) return `+2${compact}`;
  if (/^\+201[0125]\d{8}$/.test(compact)) return compact;
  return null;
}

export function calculateTotals(items) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalEGP = PRODUCT_PRICE_EGP * totalQuantity;
  return {
    totalQuantity,
    subtotalEGP,
    shippingFeeEGP: totalQuantity > 0 ? SHIPPING_FEE_EGP : 0,
    codAmountEGP:
      subtotalEGP + (totalQuantity > 0 ? SHIPPING_FEE_EGP : 0),
  };
}

export function formatEGP(value) {
  return `${new Intl.NumberFormat("en-US").format(value)} جنيه`;
}

