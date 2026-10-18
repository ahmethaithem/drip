import { NextResponse } from "next/server";
import { createOrderRecord, findOrderByIdempotencyKey } from "@/db/order-store";
import { createOrderSchema } from "@/lib/order-validation";
import { EGYPT_GOVERNORATES } from "@/lib/governorates";
import { getProduct } from "@/lib/products";
import { calculateTotals, normalizeEgyptianPhone } from "@/lib/commerce.mjs";

export const dynamic = "force-dynamic";
const makeOrderNumber = () => `DRIP-EG-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;

function safeErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return undefined;
  const code = String(error.code);
  return /^[A-Z0-9_-]{2,40}$/i.test(code) ? code : undefined;
}

function orderFailure(error: unknown, reference: string, stage: string) {
  const configurationError = error instanceof Error && error.name === "OrderStoreConfigurationError";
  console.error("Order submission failed", {
    reference,
    stage,
    type: error instanceof Error ? error.name : "UnknownError",
    code: safeErrorCode(error),
  });
  return NextResponse.json(
    {
      error: configurationError
        ? "خدمة الطلبات غير مهيأة حالياً. يرجى المحاولة لاحقاً أو التواصل معنا."
        : "تعذر حفظ الطلب حالياً. حاول مرة أخرى بعد قليل.",
      reference,
    },
    { status: configurationError ? 503 : 500, headers: { "Cache-Control": "no-store" } },
  );
}

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
  const id = crypto.randomUUID();
  const number = makeOrderNumber();
  const reference = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  let stage = "idempotency_lookup";
  try {
    const existing = await findOrderByIdempotencyKey(idempotencyKey);
    if (existing) return NextResponse.json({ orderNumber: existing.orderNumber, codAmountEGP: existing.codAmountEGP, duplicate: true });
    stage = "insert";
    await createOrderRecord({ id, orderNumber: number, idempotencyKey, customerName: customer.fullName, primaryPhone, secondaryPhone,
      governorate: customer.governorate, city: customer.city, address: customer.address,
      buildingNumber: customer.buildingNumber || null, floorApartment: customer.floorApartment || null, landmark: customer.landmark || null, notes: customer.notes || null,
      itemsJson: JSON.stringify(safeItems), subtotalEGP: totals.subtotalEGP, shippingFeeEGP: totals.shippingFeeEGP, codAmountEGP: totals.codAmountEGP });
  } catch (error) {
    if (stage === "insert") {
      try {
        const duplicate = await findOrderByIdempotencyKey(idempotencyKey);
        if (duplicate) return NextResponse.json({ orderNumber: duplicate.orderNumber, codAmountEGP: duplicate.codAmountEGP, duplicate: true });
      } catch {
        // Preserve the original insert error and its diagnostic reference.
      }
    }
    return orderFailure(error, reference, stage);
  }
  return NextResponse.json(
    { orderNumber: number, codAmountEGP: totals.codAmountEGP },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}

