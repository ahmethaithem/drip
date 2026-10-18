import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
const csv = (value: unknown) => `"${String(value ?? "").replace(/"/g,'""')}"`;

export async function GET(request: Request) {
  if (!await requireAdminApi()) return NextResponse.json({ error:"غير مصرح." }, { status:401 });
  const ids = new URL(request.url).searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  const db = getDb();
  const rows = ids.length ? await db.select().from(orders).where(inArray(orders.id,ids)).all() : await db.select().from(orders).where(eq(orders.exported,false)).all();
  const header = ["رقم الطلب","التاريخ","الحالة","الاسم","الموبايل","موبايل إضافي","المحافظة","المدينة/المنطقة","العنوان","المبنى","الدور والشقة","علامة مميزة","المنتجات","إجمالي المنتجات","الشحن","مبلغ التحصيل","ملاحظات"];
  const lines = rows.map((row) => {
    const items = JSON.parse(row.itemsJson) as Array<{name:string;size:string;color:string;quantity:number;unitPriceEGP:number}>;
    const products = items.map((item) => `${item.name} | ${item.color} | ${item.size} | عدد ${item.quantity} | ${item.unitPriceEGP}`).join(" / ");
    return [row.orderNumber,row.createdAt,row.status,row.customerName,row.primaryPhone,row.secondaryPhone,row.governorate,row.city,row.address,row.buildingNumber,row.floorApartment,row.landmark,products,row.subtotalEGP,row.shippingFeeEGP,row.codAmountEGP,row.notes].map(csv).join(",");
  });
  if (rows.length) await db.update(orders).set({ exported:true, updatedAt:new Date().toISOString() }).where(inArray(orders.id,rows.map((row) => row.id)));
  return new NextResponse(`\uFEFF${header.map(csv).join(",")}\r\n${lines.join("\r\n")}`, { headers:{ "Content-Type":"text/csv; charset=utf-8", "Content-Disposition":`attachment; filename="drip-egypt-orders-${new Date().toISOString().slice(0,10)}.csv"` } });
}

