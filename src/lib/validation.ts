import { z } from "zod";

import {
  CATEGORIES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PLATFORMS,
  PRODUCT_CONDITIONS,
  PRODUCT_PUBLICATION_STATUSES,
  PRODUCT_TYPES,
} from "@/lib/constants";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const customerSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(40),
  document: z.string().trim().max(40).optional(),
});

export const addressSchema = z
  .object({
    street: z.string().trim().max(160).optional(),
    city: z.string().trim().max(80).optional(),
    province: z.string().trim().max(80).optional(),
    postalCode: z.string().trim().max(20).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .optional();

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  customer: customerSchema,
  address: addressSchema,
  notes: z.string().trim().max(500).optional(),
  couponCode: z.string().trim().max(40).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional().default("mercadopago"),
  termsAccepted: z.literal(true),
});

export const searchSchema = z.object({
  q: z.string().trim().min(2).max(80),
});

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  internalComment: z.string().trim().max(500).optional(),
});

export const adminOrdersQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  email: z.string().trim().max(160).optional(),
  from: z.string().trim().max(20).optional(),
  to: z.string().trim().max(20).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z
    .enum(["pending", "approved", "rejected", "cancelled", "refunded"])
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(12),
});

export const transferProofReviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  proofId: z.string().min(1),
  reason: z.string().trim().max(500).optional(),
});

export const accountProfileSchema = z.object({
  firstName: z.string().trim().max(80),
  lastName: z.string().trim().max(80),
  phone: z.string().trim().max(40),
  street: z.string().trim().max(160),
  city: z.string().trim().max(80),
  province: z.string().trim().max(80),
  postalCode: z.string().trim().max(20),
  addressNotes: z.string().trim().max(500).optional(),
});

export const linkGuestOrdersSchema = z.object({
  confirm: z.literal(true),
});

export const accountSyncSchema = z.object({
  items: z.array(cartItemSchema).max(100).optional().default([]),
  favoriteProductIds: z
    .array(z.string().trim().min(1).max(160))
    .max(200)
    .optional()
    .default([]),
});

export const digitalDeliverySchema = z.object({
  secureReference: z.string().trim().min(3).max(2000),
  internalNote: z.string().trim().min(3).max(2000),
  channel: z.enum(["email", "whatsapp", "manual"]),
});

export const productMutationSchema = z.object({
  id: z.string().min(1),
  slug: z.string().trim().min(3).max(120),
  name: z.string().trim().min(3).max(160),
  shortDescription: z.string().trim().min(3).max(220),
  description: z.string().trim().min(3).max(4000),
  category: z.enum(CATEGORIES),
  platform: z.enum(PLATFORMS).optional(),
  type: z.enum(PRODUCT_TYPES),
  condition: z.enum(PRODUCT_CONDITIONS),
  brand: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  priceCents: z.coerce.number().int().positive(),
  promoPriceCents: z.coerce.number().int().positive().optional(),
  sku: z.string().trim().min(3).max(80),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  publicationStatus: z.enum(PRODUCT_PUBLICATION_STATUSES),
  featured: z.boolean().default(false),
  offer: z.boolean().default(false),
});
