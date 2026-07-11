import "server-only";

import { randomBytes } from "crypto";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";

function generatePublicOrderNumber(): string {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  })
    .format(now)
    .replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `TPG-${date}-${suffix}`;
}

function generateGuestToken(): string {
  return randomBytes(32).toString("hex");
}

export async function persistOrderToSupabase(
  order: Order,
  userId?: string,
): Promise<{
  success: boolean;
  publicOrderNumber?: string;
  guestToken?: string;
  error?: string;
}> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      success: false,
      error: "Supabase no configurado. El pedido se guarda en memoria.",
    };
  }

  const publicOrderNumber = generatePublicOrderNumber();

  try {
    const { error: orderError } = await supabase.from("orders").upsert({
      id: order.id,
      user_id: userId ?? null,
      public_order_number: publicOrderNumber,
      guest_email: order.customer.email,
      guest_phone: order.customer.phone,
      customer_snapshot: order.customer,
      address_snapshot: order.address ?? null,
      delivery_method: order.deliveryMethod,
      payment_method: order.paymentMethod ?? "mercadopago",
      status: order.status,
      payment_status: order.paymentStatus,
      currency: "ARS",
      subtotal_cents: order.totals.subtotalCents,
      product_discount_cents: order.totals.productDiscountCents,
      coupon_discount_cents: order.totals.couponDiscountCents,
      shipping_cents: order.totals.shippingCents,
      total_cents: order.totals.totalCents,
      coupon_code: order.couponCode ?? null,
      notes: order.notes ?? null,
      transfer_expires_at: order.transferExpiresAt ?? null,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    });

    if (orderError) {
      return { success: false, error: orderError.message };
    }

    if (order.items.length > 0) {
      const { error: itemsError } = await supabase.from("order_items").insert(
        order.items.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          variant_id: item.variantId ?? null,
          product_name: item.productName,
          variant_label: item.variantLabel ?? null,
          sku: item.sku,
          category: item.category,
          platform: item.platform ?? null,
          type: item.type,
          unit_price_cents: item.unitPriceCents,
          original_unit_price_cents: item.originalUnitPriceCents,
          quantity: item.quantity,
          discount_cents: item.discountCents,
          total_cents: item.totalCents,
        })),
      );

      if (itemsError) {
        return { success: false, error: itemsError.message };
      }
    }

    let guestToken: string | undefined;
    if (!userId) {
      guestToken = generateGuestToken();
      const { error: tokenError } = await supabase
        .from("guest_order_access")
        .insert({
          order_id: order.id,
          email: order.customer.email,
          access_token: guestToken,
        });

      if (tokenError) {
        return { success: false, error: tokenError.message };
      }
    }

    const { error: eventError } = await supabase
      .from("order_events")
      .insert({
        order_id: order.id,
        event_type: "order_created",
        actor_id: userId ?? null,
        actor_role: userId ? "customer" : null,
        payload: {
          paymentMethod: order.paymentMethod ?? "mercadopago",
          totalCents: order.totals.totalCents,
          itemCount: order.items.length,
        },
        internal_note: "Pedido creado desde checkout.",
      });

    if (eventError) {
      return { success: false, error: eventError.message };
    }

    return {
      success: true,
      publicOrderNumber,
      guestToken,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido.",
    };
  }
}

export async function findOrderByPublicNumber(
  publicNumber: string,
  email: string,
): Promise<{
  order: Order | null;
  error?: string;
}> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { order: null, error: "Supabase no configurado." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("public_order_number", publicNumber)
    .eq("guest_email", email.toLowerCase().trim())
    .single();

  if (error || !data) {
    return { order: null };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", data.id)
    .order("product_name");

  const order: Order = {
    id: data.id,
    orderNumber: data.public_order_number,
    userId: data.user_id ?? undefined,
    customer: data.customer_snapshot,
    address: data.address_snapshot ?? undefined,
    deliveryMethod: data.delivery_method,
    paymentMethod: data.payment_method,
    transferExpiresAt: data.transfer_expires_at ?? undefined,
    notes: data.notes ?? undefined,
    items: (items ?? []).map((item) => ({
      productId: item.product_id,
      variantId: item.variant_id ?? undefined,
      productName: item.product_name,
      variantLabel: item.variant_label ?? undefined,
      sku: item.sku,
      category: item.category,
      platform: item.platform ?? undefined,
      type: item.type,
      unitPriceCents: item.unit_price_cents,
      originalUnitPriceCents: item.original_unit_price_cents,
      quantity: item.quantity,
      discountCents: item.discount_cents,
      totalCents: item.total_cents,
    })),
    totals: {
      subtotalCents: data.subtotal_cents,
      productDiscountCents: data.product_discount_cents,
      couponDiscountCents: data.coupon_discount_cents,
      shippingCents: data.shipping_cents,
      totalCents: data.total_cents,
    },
    couponCode: data.coupon_code ?? undefined,
    status: data.status,
    paymentStatus: data.payment_status,
    payments: [],
    statusHistory: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return { order };
}

export async function linkGuestOrdersToUser(
  userId: string,
  email: string,
): Promise<{ linked: number; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { linked: 0, error: "Supabase no configurado." };
  }

  const { data, error } = await supabase.rpc("link_guest_orders_to_user", {
    p_user_id: userId,
    p_email: email,
  });

  if (error) {
    return { linked: 0, error: error.message };
  }

  return { linked: data ?? 0 };
}
