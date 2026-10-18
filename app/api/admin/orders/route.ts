import { NextResponse } from "next/server";
import { listOrders } from "@/db/order-store";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export async function GET() {
  if (!await requireAdminApi()) return NextResponse.json({ error:"غير مصرح." }, { status:401 });
  const rows = await listOrders();
  return NextResponse.json({ orders: rows.map((row) => ({ ...row, items: JSON.parse(row.itemsJson) })) });
}

