import { z } from "zod";

export const createOrderSchema = z.object({
  idempotencyKey: z.string().uuid(), honeypot: z.string().max(0).optional().default(""),
  customer: z.object({
    fullName: z.string().trim().min(3).max(100), primaryPhone: z.string().min(8).max(30),
    secondaryPhone: z.string().max(30).optional().default(""), governorate: z.string().min(2).max(40),
    city: z.string().trim().min(2).max(100), address: z.string().trim().min(5).max(300),
    buildingNumber: z.string().trim().max(30).optional().default(""), floorApartment: z.string().trim().max(80).optional().default(""),
    landmark: z.string().trim().max(200).optional().default(""), notes: z.string().trim().max(500).optional().default(""),
  }),
  items: z.array(z.object({ productId: z.string().min(1).max(64), size: z.enum(["S", "M", "L", "XL"]), quantity: z.number().int().min(1).max(10) })).min(1).max(30),
});

export const ORDER_STATUSES = ["طلب جديد", "تم التأكيد", "جاري التجهيز", "تم الشحن", "تم التسليم", "ملغي"] as const;
export const updateOrderSchema = z.object({
  customerName: z.string().trim().min(3).max(100).optional(), primaryPhone: z.string().min(8).max(30).optional(),
  secondaryPhone: z.string().max(30).nullable().optional(), governorate: z.string().min(2).max(40).optional(),
  city: z.string().trim().min(2).max(100).optional(), address: z.string().trim().min(5).max(300).optional(),
  buildingNumber: z.string().max(30).nullable().optional(), floorApartment: z.string().max(80).nullable().optional(),
  landmark: z.string().max(200).nullable().optional(), notes: z.string().max(500).nullable().optional(),
  codAmountEGP: z.number().int().min(0).max(500000).optional(), status: z.enum(ORDER_STATUSES).optional(),
});

