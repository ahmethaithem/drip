import { NextResponse } from "next/server";
import { createOrderRecord, findOrderByIdempotencyKey } from "@/db/order-store";
import { createOrderSchema } from "@/lib/order-validation";
import { EGYPT_GOVERNORATES } from "@/lib/governorates";
import { getProduct } from "@/lib/products";
import { calculateTotals, normalizeEgyptianPhone } from "@/lib/commerce.mjs";

export const dynamic = "force-dynamic";
const makeOrderNumber = () => `DRIP-EG-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 }); }
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "يرجى مراجعة بيانات الطلب." }, { status: 400 });
  if (parsed.data.honeypot) return NextResponse.json({ error: "تعذر إرسال الطلب." }, { status: 400 });
  const { customer, items, idempotencyKey } = parsed.data;
  const primaryPhone = normalizeEgyptianPhone(customer.primaryPhone);
  const secondaryPhone = customer.secondaryPhone ? normalizeEgyptianPhone(customer.secondaryPhone) : null;
  if (!primaryPhone || (customer.secondaryPhone && !secondaryPhone)) return NextResponse.json({ error: "يرجى إدخال رقم موبايل مصري صحيح.", field: "phone" }, { status: 400 });
  if (!EGYPT_GOVERNORATES.includes(customer.governorate as (typeof EGYPT_GOVERNORATES)[number])) return NextResponse.json({ error: "يرجى اختيار محافظة مصرية صحيحة." }, { status: 400 });
  const safeItems = [];
  for (const item of items) {
    const product = getProduct(item.productId);
    if (!product) return NextResponse.json({ error: "أحد المنتجات غير متاح." }, { status: 400 });
    safeItems.push({ productId: product.id, name: product.name, size: item.size, color: product.color, quantity: item.quantity, unitPriceEGP: product.priceEGP, lineTotalEGP: product.priceEGP * item.quantity, image: product.images[0] });
  }
  const totals = calculateTotals(safeItems);
  const existing = await findOrderByIdempotencyKey(idempotencyKey);
  if (existing) return NextResponse.json({ orderNumber: existing.orderNumber, codAmountEGP: existing.codAmountEGP, duplicate: true });
  const id = crypto.randomUUID();
  const number = makeOrderNumber();
  try {
    await createOrderRecord({ id, orderNumber: number, idempotencyKey, customerName: customer.fullName, primaryPhone, secondaryPhone,
      governorate: customer.governorate, city: customer.city, address: customer.address,
      buildingNumber: customer.buildingNumber || null, floorApartment: customer.floorApartment || null, landmark: customer.landmark || null, notes: customer.notes || null,
      itemsJson: JSON.stringify(safeItems), subtotalEGP: totals.subtotalEGP, shippingFeeEGP: totals.shippingFeeEGP, codAmountEGP: totals.codAmountEGP });
  } catch (error) {
    const duplicate = await findOrderByIdempotencyKey(idempotencyKey);
    if (duplicate) return NextResponse.json({ orderNumber: duplicate.orderNumber, codAmountEGP: duplicate.codAmountEGP, duplicate: true });
    console.error("Order insert failed", error);
    return NextResponse.json({ error: "تعذر حفظ الطلب حالياً. حاول مرة أخرى." }, { status: 500 });
  }
  return NextResponse.json({ orderNumber: number, codAmountEGP: totals.codAmountEGP }, { status: 201 });
}

