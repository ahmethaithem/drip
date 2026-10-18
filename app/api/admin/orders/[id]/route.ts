import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireAdminApi } from "@/lib/admin-auth";
import { updateOrderSchema } from "@/lib/order-validation";
import { normalizeEgyptianPhone } from "@/lib/commerce.mjs";
import { EGYPT_GOVERNORATES } from "@/lib/governorates";

export const dynamic = "force-dynamic";
export async function PATCH(request: Request, { params }: { params: Promise<{ id:string }> }) {
  if (!await requireAdminApi()) return NextResponse.json({ error:"غير مصرح." }, { status:401 });
  const parsed = updateOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error:"بيانات التحديث غير صالحة." }, { status:400 });
  const update = { ...parsed.data, updatedAt:new Date().toISOString() };
  if (update.primaryPhone) { const phone=normalizeEgyptianPhone(update.primaryPhone); if(!phone) return NextResponse.json({ error:"يرجى إدخال رقم موبايل مصري صحيح." }, { status:400 }); update.primaryPhone=phone; }
  if (update.secondaryPhone) { const phone=normalizeEgyptianPhone(update.secondaryPhone); if(!phone) return NextResponse.json({ error:"يرجى إدخال رقم موبايل مصري صحيح." }, { status:400 }); update.secondaryPhone=phone; }
  if (update.governorate && !EGYPT_GOVERNORATES.includes(update.governorate as (typeof EGYPT_GOVERNORATES)[number])) return NextResponse.json({ error:"المحافظة غير صالحة." }, { status:400 });
  const { id } = await params;
  await getDb().update(orders).set(update).where(eq(orders.id,id));
  const row = await getDb().select().from(orders).where(eq(orders.id,id)).get();
  if (!row) return NextResponse.json({ error:"الطلب غير موجود." }, { status:404 });
  return NextResponse.json({ order:{ ...row, items:JSON.parse(row.itemsJson) } });
}

