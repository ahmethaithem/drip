import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  gender: text("gender").notNull(),
  priceEGP: integer("price_egp").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(), orderNumber: text("order_number").notNull().unique(),
  idempotencyKey: text("idempotency_key").notNull().unique(), customerName: text("customer_name").notNull(),
  primaryPhone: text("primary_phone").notNull(), secondaryPhone: text("secondary_phone"),
  governorate: text("governorate").notNull(), city: text("city").notNull(), address: text("address").notNull(),
  buildingNumber: text("building_number"), floorApartment: text("floor_apartment"), landmark: text("landmark"), notes: text("notes"),
  itemsJson: text("items_json").notNull(), subtotalEGP: integer("subtotal_egp").notNull(),
  shippingFeeEGP: integer("shipping_fee_egp").notNull(), codAmountEGP: integer("cod_amount_egp").notNull(),
  status: text("status").notNull().default("طلب جديد"), exported: integer("exported", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

