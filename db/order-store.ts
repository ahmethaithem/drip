import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveOrderStoreConfig } from "@/lib/order-store-config.mjs";

export { OrderStoreConfigurationError } from "@/lib/order-store-config.mjs";

export type StoredOrder = {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  customerName: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  governorate: string;
  city: string;
  address: string;
  buildingNumber: string | null;
  floorApartment: string | null;
  landmark: string | null;
  notes: string | null;
  itemsJson: string;
  subtotalEGP: number;
  shippingFeeEGP: number;
  codAmountEGP: number;
  status: string;
  exported: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NewOrderRecord = Omit<StoredOrder, "status" | "exported" | "createdAt" | "updatedAt">;
export type OrderUpdate = Partial<Pick<StoredOrder,
  "customerName" | "primaryPhone" | "secondaryPhone" | "governorate" | "city" |
  "address" | "buildingNumber" | "floorApartment" | "landmark" | "notes" |
  "codAmountEGP" | "status" | "exported" | "updatedAt"
>>;

let supabaseClient: SupabaseClient | undefined;

async function getSupabase(config: { url: string; key: string }) {
  if (supabaseClient) return supabaseClient;
  const { createClient } = await import("@supabase/supabase-js");
  supabaseClient = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return supabaseClient;
}

function mapSupabaseOrder(row: Record<string, unknown>): StoredOrder {
  const items = row.items_json;
  return {
    id: String(row.id),
    orderNumber: String(row.order_number),
    idempotencyKey: String(row.idempotency_key),
    customerName: String(row.customer_name),
    primaryPhone: String(row.primary_phone),
    secondaryPhone: row.secondary_phone == null ? null : String(row.secondary_phone),
    governorate: String(row.governorate),
    city: String(row.city),
    address: String(row.address),
    buildingNumber: row.building_number == null ? null : String(row.building_number),
    floorApartment: row.floor_apartment == null ? null : String(row.floor_apartment),
    landmark: row.landmark == null ? null : String(row.landmark),
    notes: row.notes == null ? null : String(row.notes),
    itemsJson: typeof items === "string" ? items : JSON.stringify(items),
    subtotalEGP: Number(row.subtotal_egp),
    shippingFeeEGP: Number(row.shipping_fee_egp),
    codAmountEGP: Number(row.cod_amount_egp),
    status: String(row.status),
    exported: Boolean(row.exported),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toSupabaseInsert(order: NewOrderRecord) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    idempotency_key: order.idempotencyKey,
    customer_name: order.customerName,
    primary_phone: order.primaryPhone,
    secondary_phone: order.secondaryPhone,
    governorate: order.governorate,
    city: order.city,
    address: order.address,
    building_number: order.buildingNumber,
    floor_apartment: order.floorApartment,
    landmark: order.landmark,
    notes: order.notes,
    items_json: JSON.parse(order.itemsJson),
    subtotal_egp: order.subtotalEGP,
    shipping_fee_egp: order.shippingFeeEGP,
    cod_amount_egp: order.codAmountEGP,
  };
}

function toSupabaseUpdate(update: OrderUpdate) {
  const fields: Record<string, unknown> = {};
  const names: Array<[keyof OrderUpdate, string]> = [
    ["customerName", "customer_name"], ["primaryPhone", "primary_phone"],
    ["secondaryPhone", "secondary_phone"], ["governorate", "governorate"],
    ["city", "city"], ["address", "address"], ["buildingNumber", "building_number"],
    ["floorApartment", "floor_apartment"], ["landmark", "landmark"],
    ["notes", "notes"], ["codAmountEGP", "cod_amount_egp"], ["status", "status"],
    ["exported", "exported"], ["updatedAt", "updated_at"],
  ];
  for (const [source, target] of names) {
    if (source in update) fields[target] = update[source];
  }
  return fields;
}

async function getD1Context() {
  const [{ getDb }, { orders }, drizzle] = await Promise.all([
    import("./index"), import("./schema"), import("drizzle-orm"),
  ]);
  return { db: getDb(), orders, ...drizzle };
}

export async function findOrderByIdempotencyKey(idempotencyKey: string) {
  const config = resolveOrderStoreConfig();
  if (config.backend === "supabase") {
    const client = await getSupabase(config);
    const { data, error } = await client.from("orders").select("*").eq("idempotency_key", idempotencyKey).maybeSingle();
    if (error) throw error;
    return data ? mapSupabaseOrder(data) : undefined;
  }
  const { db, orders, eq } = await getD1Context();
  return db.select().from(orders).where(eq(orders.idempotencyKey, idempotencyKey)).get();
}

export async function createOrderRecord(order: NewOrderRecord) {
  const config = resolveOrderStoreConfig();
  if (config.backend === "supabase") {
    const client = await getSupabase(config);
    const { error } = await client.from("orders").insert(toSupabaseInsert(order));
    if (error) throw error;
    return;
  }
  const { db, orders } = await getD1Context();
  await db.insert(orders).values(order);
}

export async function listOrders() {
  const config = resolveOrderStoreConfig();
  if (config.backend === "supabase") {
    const client = await getSupabase(config);
    const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapSupabaseOrder);
  }
  const { db, orders, desc } = await getD1Context();
  return db.select().from(orders).orderBy(desc(orders.createdAt)).all();
}

export async function updateOrderById(id: string, update: OrderUpdate) {
  const config = resolveOrderStoreConfig();
  if (config.backend === "supabase") {
    const client = await getSupabase(config);
    const { data, error } = await client.from("orders").update(toSupabaseUpdate(update)).eq("id", id).select("*").maybeSingle();
    if (error) throw error;
    return data ? mapSupabaseOrder(data) : undefined;
  }
  const { db, orders, eq } = await getD1Context();
  await db.update(orders).set(update).where(eq(orders.id, id));
  return db.select().from(orders).where(eq(orders.id, id)).get();
}

export async function listOrdersForExport(ids: string[]) {
  const config = resolveOrderStoreConfig();
  if (config.backend === "supabase") {
    const client = await getSupabase(config);
    let query = client.from("orders").select("*");
    query = ids.length ? query.in("id", ids) : query.eq("exported", false);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapSupabaseOrder);
  }
  const { db, orders, eq, inArray } = await getD1Context();
  return ids.length
    ? db.select().from(orders).where(inArray(orders.id, ids)).all()
    : db.select().from(orders).where(eq(orders.exported, false)).all();
}

export async function markOrdersExported(ids: string[]) {
  if (!ids.length) return;
  const updatedAt = new Date().toISOString();
  const config = resolveOrderStoreConfig();
  if (config.backend === "supabase") {
    const client = await getSupabase(config);
    const { error } = await client.from("orders").update({ exported: true, updated_at: updatedAt }).in("id", ids);
    if (error) throw error;
    return;
  }
  const { db, orders, inArray } = await getD1Context();
  await db.update(orders).set({ exported: true, updatedAt }).where(inArray(orders.id, ids));
}
