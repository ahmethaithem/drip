import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export async function GET() {
  if (!await requireAdminApi()) return NextResponse.json({ error:"غير مصرح." }, { status:401 });
  const rows = await getDb().select().from(orders).orderBy(desc(orders.createdAt)).all();
  return NextResponse.json({ orders: rows.map((row) => ({ ...row, items: JSON.parse(row.itemsJson) })) });
}

