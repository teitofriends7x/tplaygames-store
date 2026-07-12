import "server-only";

import { randomBytes } from "crypto";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  addOrderEvent,
  addTransferProof,
  findOrder,
  findOrderForCustomer,
  listOrderEvents,
  listOrders,
  listOrdersByCustomer,
  listTransferProofs,
  replaceOrder,
  updateTransferProofStatus,
} from "@/lib/store";
import {
  applyPaymentStatus,
  registerDigitalDelivery,
  transitionOrderStatus,
} from "@/lib/orders";
import {
  buildTransferProofStoragePath,
  TRANSFER_PROOF_BUCKET,
} from "@/lib/transfer-proofs";
import type {
  AccountProfile,
  DigitalDelivery,
  Order,
  OrderEvent,
  OrderStatusEvent,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
  TransferProof,
} from "@/lib/types";

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

function actorColumns(actorId?: string) {
  return isUuid(actorId ?? "")
    ? { actor_id: actorId, actor_clerk_user_id: null }
    : { actor_id: null, actor_clerk_user_id: actorId ?? null };
}

export async function persistOrderToSupabase(
  order: Order,
  owner: { clerkUserId?: string; legacyUserId?: string } = {},
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
      user_id: owner.legacyUserId ?? null,
      clerk_user_id: owner.clerkUserId ?? null,
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
    if (!owner.clerkUserId && !owner.legacyUserId) {
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

    const { error: eventError } = await supabase.from("order_events").insert({
      order_id: order.id,
      event_type: "order_created",
      actor_id: owner.legacyUserId ?? null,
      actor_clerk_user_id: owner.clerkUserId ?? null,
      actor_role:
        owner.clerkUserId || owner.legacyUserId ? "customer" : null,
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

  const order = mapOrderRow(data, items ?? []);

  return { order };
}

export async function linkGuestOrdersToClerkUser(
  clerkUserId: string,
  email: string,
): Promise<{ linked: number; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { linked: 0, error: "Supabase no configurado." };
  }

  const { data, error } = await supabase.rpc(
    "link_guest_orders_to_clerk_user",
    {
      p_clerk_user_id: clerkUserId,
      p_email: email,
    },
  );

  if (error) {
    return { linked: 0, error: error.message };
  }

  return { linked: data ?? 0 };
}

export type AdminOrderFilters = {
  q?: string;
  email?: string;
  from?: string;
  to?: string;
  paymentMethod?: PaymentMethod;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  pageSize?: number;
};

export async function listAdminOrders(
  filters: AdminOrderFilters = {},
): Promise<{
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 12));
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    const filtered = filterOrders(listOrders(), filters);
    return paginateOrders(filtered, page, pageSize);
  }

  let query = supabase.from("orders").select("*", { count: "exact" });
  if (filters.q) {
    query = query.or(
      `public_order_number.ilike.%${filters.q}%,order_number.ilike.%${filters.q}%`,
    );
  }
  if (filters.email) {
    query = query.ilike("guest_email", `%${filters.email}%`);
  }
  if (filters.paymentMethod) {
    query = query.eq("payment_method", filters.paymentMethod);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }
  if (filters.from) {
    query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  }
  if (filters.to) {
    query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    const filtered = filterOrders(listOrders(), filters);
    return paginateOrders(filtered, page, pageSize);
  }

  const orders = await hydrateOrders(data);
  const total = count ?? orders.length;

  return {
    orders,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getOrderDetailsForAdmin(
  idOrNumber: string,
): Promise<Order | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    const order = findOrder(idOrNumber);
    return order
      ? {
          ...order,
          transferProofs: listTransferProofs(order.id),
          events: listOrderEvents(order.id),
        }
      : null;
  }

  const query = supabase.from("orders").select("*");
  const { data } = isUuid(idOrNumber)
    ? await query
        .or(`id.eq.${idOrNumber},public_order_number.eq.${idOrNumber}`)
        .maybeSingle()
    : await query.eq("public_order_number", idOrNumber).maybeSingle();
  if (!data) return null;

  const [items, proofs, events, statusHistory, digitalDelivery] =
    await Promise.all([
      loadOrderItems(data.id),
      loadTransferProofs(data.id),
      loadOrderEvents(data.id),
      loadOrderStatusHistory(data.id),
      loadDigitalDelivery(data.id),
    ]);

  return mapOrderRow(
    data,
    items,
    proofs,
    events,
    statusHistory,
    digitalDelivery,
  );
}

export async function getOrderForCustomer(options: {
  idOrNumber: string;
  email?: string;
  clerkUserId?: string;
  userId?: string;
}): Promise<Order | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    const order = findOrderForCustomer(
      options.idOrNumber,
      options.email,
      options.clerkUserId ?? options.userId,
    );
    return order
      ? {
          ...order,
          transferProofs: listTransferProofs(order.id),
          events: listOrderEvents(order.id),
        }
      : null;
  }

  let query = supabase.from("orders").select("*");
  query = isUuid(options.idOrNumber)
    ? query.or(
        `id.eq.${options.idOrNumber},public_order_number.eq.${options.idOrNumber}`,
      )
    : query.eq("public_order_number", options.idOrNumber);

  if (options.clerkUserId) {
    query = query.eq("clerk_user_id", options.clerkUserId);
  } else if (options.userId) {
    query = query.eq("user_id", options.userId);
  } else if (options.email) {
    query = query.eq("guest_email", options.email.toLowerCase().trim());
  } else {
    return null;
  }

  const { data } = await query.maybeSingle();
  if (!data) return null;

  const [items, proofs, events, statusHistory, digitalDelivery] =
    await Promise.all([
      loadOrderItems(data.id),
      loadTransferProofs(data.id),
      loadOrderEvents(data.id),
      loadOrderStatusHistory(data.id),
      loadDigitalDelivery(data.id),
    ]);

  return mapOrderRow(
    data,
    items,
    proofs,
    events,
    statusHistory,
    digitalDelivery,
  );
}

export async function listAccountOrders(options: {
  clerkUserId?: string;
  userId?: string;
  email?: string;
}): Promise<Order[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return listOrdersByCustomer({
      userId: options.clerkUserId ?? options.userId,
      email: options.email,
    });
  }

  let query = supabase.from("orders").select("*");
  if (options.clerkUserId) {
    query = query.eq("clerk_user_id", options.clerkUserId);
  } else if (options.userId && options.email) {
    query = query.or(
      `user_id.eq.${options.userId},guest_email.eq.${options.email.toLowerCase().trim()}`,
    );
  } else if (options.userId) {
    query = query.eq("user_id", options.userId);
  } else if (options.email) {
    query = query.eq("guest_email", options.email.toLowerCase().trim());
  } else {
    return [];
  }

  const { data } = await query.order("created_at", { ascending: false });
  return data ? hydrateOrders(data) : [];
}

export async function getAccountProfile(options: {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<AccountProfile> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      id: options.clerkUserId,
      email: options.email,
      firstName: options.firstName,
      lastName: options.lastName,
      phone: options.phone,
    };
  }

  const { data: profile } = await supabase
    .from("clerk_profiles")
    .select("*")
    .eq("clerk_user_id", options.clerkUserId)
    .maybeSingle();

  return {
    id: options.clerkUserId,
    email: options.email,
    firstName: profile?.first_name ?? options.firstName,
    lastName: profile?.last_name ?? options.lastName,
    phone: profile?.phone ?? options.phone,
    street: profile?.street ?? undefined,
    city: profile?.city ?? undefined,
    province: profile?.province ?? undefined,
    postalCode: profile?.postal_code ?? undefined,
    addressNotes: profile?.address_notes ?? undefined,
  };
}

export async function updateAccountProfile(
  profile: AccountProfile,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { ok: true };
  }

  const { error } = await supabase.from("clerk_profiles").upsert({
    clerk_user_id: profile.id,
    email: profile.email.toLowerCase().trim(),
    first_name: profile.firstName ?? null,
    last_name: profile.lastName ?? null,
    phone: profile.phone ?? null,
    street: profile.street ?? null,
    city: profile.city ?? null,
    province: profile.province ?? null,
    postal_code: profile.postalCode ?? null,
    address_notes: profile.addressNotes ?? null,
    updated_at: new Date().toISOString(),
  });

  return error
    ? { ok: false, error: error.message }
    : { ok: true };
}

export async function countGuestOrdersForEmail(email: string): Promise<number> {
  const normalized = email.toLowerCase().trim();
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return listOrders().filter(
      (order) =>
        !order.userId &&
        order.customer.email.toLowerCase().trim() === normalized,
    ).length;
  }

  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .is("clerk_user_id", null)
    .eq("guest_email", normalized);

  return count ?? 0;
}

export async function submitTransferProof(input: {
  order: Order;
  bytes: Uint8Array;
  fileName: string;
  mimeType: "image/jpeg" | "image/png" | "application/pdf";
  extension: string;
  actorId?: string;
  actorClerkUserId?: string;
  actorRole?: Role;
  guestEmail?: string;
  uploadedIp?: string;
}): Promise<{ proof?: TransferProof; order: Order; error?: string }> {
  const storagePath = buildTransferProofStoragePath({
    orderId: input.order.id,
    fileName: input.fileName,
    extension: input.extension,
  });
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  if (!supabase) {
    const localActorId = input.actorClerkUserId ?? input.actorId;
    const proof = addTransferProof({
      orderId: input.order.id,
      uploadedBy: localActorId,
      guestEmail: input.guestEmail,
      storagePath: `development://${storagePath}`,
      fileName: input.fileName,
      fileSizeBytes: input.bytes.byteLength,
      mimeType: input.mimeType,
      status: "pending",
    });
    const updated = transitionOrderStatus(
      input.order,
      "transfer_proof_submitted",
      { id: localActorId, role: input.actorRole ?? "customer" },
      "Comprobante de transferencia enviado.",
    );
    replaceOrder(updated);
    addOrderEvent({
      orderId: updated.id,
      eventType: "transfer_proof_submitted",
      actorId: localActorId,
      actorRole: input.actorRole ?? "customer",
      payload: {
        proofId: proof.id,
        fileName: proof.fileName,
        mimeType: proof.mimeType,
        fileSizeBytes: proof.fileSizeBytes,
      },
      internalNote: "Comprobante cargado en modo desarrollo.",
    });

    return { proof, order: updated };
  }

  const upload = await supabase.storage
    .from(TRANSFER_PROOF_BUCKET)
    .upload(storagePath, input.bytes, {
      contentType: input.mimeType,
      upsert: false,
    });
  if (upload.error) {
    return { order: input.order, error: upload.error.message };
  }

  const { data: proofRow, error: proofError } = await supabase
    .from("transfer_proofs")
    .insert({
      order_id: input.order.id,
      uploaded_by: input.actorId ?? null,
      uploaded_by_clerk_user_id: input.actorClerkUserId ?? null,
      uploaded_by_role: input.actorRole ?? null,
      guest_email: input.guestEmail ?? null,
      storage_path: storagePath,
      file_name: input.fileName,
      original_file_name: input.fileName,
      file_size_bytes: input.bytes.byteLength,
      mime_type: input.mimeType,
      status: "pending",
      uploaded_ip: input.uploadedIp ?? null,
    })
    .select("*")
    .single();
  if (proofError) {
    return { order: input.order, error: proofError.message };
  }

  await Promise.all([
    supabase
      .from("orders")
      .update({
        status: "transfer_proof_submitted",
        updated_at: now,
      })
      .eq("id", input.order.id),
    supabase.from("order_events").insert({
      order_id: input.order.id,
      event_type: "transfer_proof_submitted",
      actor_id: input.actorId ?? null,
      actor_clerk_user_id: input.actorClerkUserId ?? null,
      actor_role: input.actorRole ?? "customer",
      payload: {
        proofId: proofRow.id,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: input.bytes.byteLength,
      },
      internal_note: "Comprobante de transferencia cargado.",
    }),
  ]);

  const proof = mapTransferProofRow(proofRow);
  return {
    proof,
    order: {
      ...input.order,
      status: "transfer_proof_submitted",
      transferProofs: [proof, ...(input.order.transferProofs ?? [])],
      updatedAt: now,
    },
  };
}

export async function createTransferProofSignedUrl(
  proof: TransferProof,
): Promise<string | undefined> {
  if (proof.signedUrl) return proof.signedUrl;
  if (proof.storagePath.startsWith("development://")) return undefined;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return undefined;

  const { data } = await supabase.storage
    .from(TRANSFER_PROOF_BUCKET)
    .createSignedUrl(proof.storagePath, 60 * 10);

  return data?.signedUrl;
}

export async function reviewTransferProof(input: {
  orderId: string;
  proofId: string;
  action: "approve" | "reject";
  reason?: string;
  actorId?: string;
  actorRole: Role;
}): Promise<{ order?: Order; proof?: TransferProof; error?: string }> {
  const supabase = getSupabaseAdminClient();
  const isApproval = input.action === "approve";
  const now = new Date().toISOString();

  if (!supabase) {
    const order = findOrder(input.orderId);
    if (!order) return { error: "Pedido no encontrado." };
    const proof = updateTransferProofStatus(
      input.proofId,
      isApproval ? "approved" : "rejected",
      {
        reviewedBy: input.actorId ?? input.actorRole,
        rejectionReason: isApproval ? undefined : input.reason,
      },
    );
    const updated = isApproval
      ? applyPaymentStatus(order, "approved")
      : {
          ...transitionOrderStatus(
            order,
            "pending_payment",
            { id: input.actorId, role: input.actorRole },
            input.reason ?? "Comprobante rechazado.",
          ),
          paymentStatus: "rejected" as PaymentStatus,
        };
    replaceOrder(updated);
    addOrderEvent({
      orderId: order.id,
      eventType: isApproval ? "transfer_approved" : "transfer_rejected",
      actorId: input.actorId,
      actorRole: input.actorRole,
      payload: { proofId: proof.id, reason: input.reason },
    });

    return { order: updated, proof };
  }

  const proofStatus = isApproval ? "approved" : "rejected";
  const reviewer = actorColumns(input.actorId);
  const { data: proofRow, error: proofError } = await supabase
    .from("transfer_proofs")
    .update({
      status: proofStatus,
      rejection_reason: isApproval ? null : (input.reason ?? null),
      reviewed_by: reviewer.actor_id,
      reviewed_by_clerk_user_id: reviewer.actor_clerk_user_id,
      reviewed_at: now,
      updated_at: now,
    })
    .eq("id", input.proofId)
    .eq("order_id", input.orderId)
    .select("*")
    .single();
  if (proofError || !proofRow) {
    return { error: proofError?.message ?? "Comprobante no encontrado." };
  }

  const orderUpdate = isApproval
    ? {
        payment_status: "approved",
        status: "paid",
        updated_at: now,
      }
    : {
        payment_status: "rejected",
        status: "pending_payment",
        updated_at: now,
      };

  await Promise.all([
    supabase.from("orders").update(orderUpdate).eq("id", input.orderId),
    supabase.from("order_events").insert({
      order_id: input.orderId,
      event_type: isApproval ? "transfer_approved" : "transfer_rejected",
      ...actorColumns(input.actorId),
      actor_role: input.actorRole,
      payload: { proofId: input.proofId, reason: input.reason ?? null },
      internal_note: isApproval
        ? "Transferencia aprobada desde administración."
        : "Transferencia rechazada desde administración.",
    }),
  ]);

  return {
    order: (await getOrderDetailsForAdmin(input.orderId)) ?? undefined,
    proof: mapTransferProofRow(proofRow),
  };
}

export async function updateStoredOrderStatus(input: {
  orderId: string;
  status: OrderStatus;
  internalComment?: string;
  actorId?: string;
  actorRole: Role;
}): Promise<{ order?: Order; error?: string }> {
  const order = await getOrderDetailsForAdmin(input.orderId);
  if (!order) {
    return { error: "Pedido no encontrado." };
  }

  const updated = transitionOrderStatus(
    order,
    input.status,
    { id: input.actorId, role: input.actorRole },
    input.internalComment,
  );
  const supabase = getSupabaseAdminClient();
  const eventPayload = {
    status: input.status,
    internalComment: input.internalComment ?? null,
  };

  if (!supabase) {
    replaceOrder(updated);
    addOrderEvent({
      orderId: updated.id,
      eventType: "order_status_updated",
      actorId: input.actorId,
      actorRole: input.actorRole,
      payload: eventPayload,
      internalNote: input.internalComment,
    });
    return { order: updated };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: input.status,
      updated_at: updated.updatedAt,
    })
    .eq("id", order.id);
  if (error) {
    return { error: error.message };
  }

  await Promise.all([
    supabase.from("order_status_history").insert({
      order_id: order.id,
      status: input.status,
      ...actorColumns(input.actorId),
      actor_role: input.actorRole,
      internal_comment: input.internalComment ?? null,
      created_at: updated.updatedAt,
    }),
    supabase.from("order_events").insert({
      order_id: order.id,
      event_type: "order_status_updated",
      ...actorColumns(input.actorId),
      actor_role: input.actorRole,
      payload: eventPayload,
      internal_note: input.internalComment ?? null,
    }),
  ]);

  return { order: (await getOrderDetailsForAdmin(order.id)) ?? updated };
}

export async function registerStoredDigitalDelivery(input: {
  orderId: string;
  secureReference: string;
  internalNote: string;
  channel: "email" | "whatsapp" | "manual";
  actorId?: string;
  actorRole: Role;
}): Promise<{ order?: Order; error?: string }> {
  const order = await getOrderDetailsForAdmin(input.orderId);
  if (!order) {
    return { error: "Pedido no encontrado." };
  }

  let updated: Order;
  try {
    updated = registerDigitalDelivery(order, {
      secureReference: input.secureReference,
      internalNote: input.internalNote,
      channel: input.channel,
      deliveredBy: input.actorId ?? input.actorRole,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo registrar la entrega digital.",
    };
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    replaceOrder(updated);
    addOrderEvent({
      orderId: updated.id,
      eventType: "digital_delivery_registered",
      actorId: input.actorId,
      actorRole: input.actorRole,
      payload: { channel: input.channel },
      internalNote: input.internalNote,
    });
    return { order: updated };
  }

  const { error: deliveryError } = await supabase
    .from("digital_deliveries")
    .upsert({
      order_id: order.id,
      secure_reference: input.secureReference,
      internal_note: input.internalNote,
      channel: input.channel,
      delivered_by: actorColumns(input.actorId).actor_id,
      delivered_by_clerk_user_id:
        actorColumns(input.actorId).actor_clerk_user_id,
      delivered_at:
        updated.digitalDelivery?.deliveredAt ?? new Date().toISOString(),
    });
  if (deliveryError) {
    return { error: deliveryError.message };
  }

  const now = updated.updatedAt;
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: updated.status,
      updated_at: now,
    })
    .eq("id", order.id);
  if (orderError) {
    return { error: orderError.message };
  }

  await Promise.all([
    supabase.from("order_status_history").insert({
      order_id: order.id,
      status: updated.status,
      ...actorColumns(input.actorId),
      actor_role: input.actorRole,
      internal_comment: "Entrega digital registrada manualmente.",
      created_at: now,
    }),
    supabase.from("order_events").insert({
      order_id: order.id,
      event_type: "digital_delivery_registered",
      ...actorColumns(input.actorId),
      actor_role: input.actorRole,
      payload: { channel: input.channel },
      internal_note: input.internalNote,
    }),
  ]);

  return { order: (await getOrderDetailsForAdmin(order.id)) ?? updated };
}

function filterOrders(orders: Order[], filters: AdminOrderFilters): Order[] {
  const q = filters.q?.toLowerCase().trim();
  const email = filters.email?.toLowerCase().trim();
  const from = filters.from
    ? new Date(`${filters.from}T00:00:00`).getTime()
    : 0;
  const to = filters.to
    ? new Date(`${filters.to}T23:59:59`).getTime()
    : Infinity;

  return orders
    .filter((order) => {
      const createdAt = new Date(order.createdAt).getTime();
      if (q && !order.orderNumber.toLowerCase().includes(q)) return false;
      if (email && !order.customer.email.toLowerCase().includes(email))
        return false;
      if (
        filters.paymentMethod &&
        order.paymentMethod !== filters.paymentMethod
      )
        return false;
      if (filters.status && order.status !== filters.status) return false;
      if (
        filters.paymentStatus &&
        order.paymentStatus !== filters.paymentStatus
      )
        return false;
      return createdAt >= from && createdAt <= to;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function paginateOrders(orders: Order[], page: number, pageSize: number) {
  const total = orders.length;
  const start = (page - 1) * pageSize;
  return {
    orders: orders.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

async function hydrateOrders(
  rows: Record<string, unknown>[],
): Promise<Order[]> {
  return Promise.all(
    rows.map(async (row) => {
      const id = String(row.id);
      const [items, proofs, events] = await Promise.all([
        loadOrderItems(id),
        loadTransferProofs(id),
        loadOrderEvents(id),
      ]);
      return mapOrderRow(row, items, proofs, events);
    }),
  );
}

async function loadOrderItems(orderId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("product_name");

  return data ?? [];
}

async function loadTransferProofs(orderId: string): Promise<TransferProof[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return listTransferProofs(orderId);

  const { data } = await supabase
    .from("transfer_proofs")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapTransferProofRow);
}

async function loadOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return listOrderEvents(orderId);

  const { data } = await supabase
    .from("order_events")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    orderId: row.order_id,
    eventType: row.event_type,
    actorId: row.actor_clerk_user_id ?? row.actor_id ?? undefined,
    actorRole: row.actor_role ?? undefined,
    payload: row.payload ?? {},
    internalNote: row.internal_note ?? undefined,
    createdAt: row.created_at,
  }));
}

async function loadOrderStatusHistory(
  orderId: string,
): Promise<OrderStatusEvent[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return findOrder(orderId)?.statusHistory ?? [];
  }

  const { data } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    status: row.status,
    actorId: row.actor_clerk_user_id ?? row.actor_id ?? undefined,
    actorRole: row.actor_role ?? undefined,
    internalComment: row.internal_comment ?? undefined,
    createdAt: row.created_at,
  }));
}

async function loadDigitalDelivery(
  orderId: string,
): Promise<DigitalDelivery | undefined> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return findOrder(orderId)?.digitalDelivery;
  }

  const { data } = await supabase
    .from("digital_deliveries")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!data) return undefined;

  return {
    id: data.id,
    orderId: data.order_id,
    secureReference: data.secure_reference,
    internalNote: data.internal_note,
    channel: data.channel,
    deliveredBy:
      data.delivered_by_clerk_user_id ?? data.delivered_by ?? "operator",
    deliveredAt: data.delivered_at,
  };
}

function mapOrderRow(
  data: Record<string, unknown>,
  items: Record<string, unknown>[],
  transferProofs: TransferProof[] = [],
  events: OrderEvent[] = [],
  statusHistory: OrderStatusEvent[] = [],
  digitalDelivery?: DigitalDelivery,
): Order {
  const publicNumber = String(data.public_order_number ?? data.order_number);
  return {
    id: String(data.id),
    orderNumber: publicNumber,
    clerkUserId: optionalString(data.clerk_user_id),
    userId: optionalString(data.user_id),
    customer: data.customer_snapshot as Order["customer"],
    address: (data.address_snapshot ?? undefined) as Order["address"],
    deliveryMethod: data.delivery_method as Order["deliveryMethod"],
    paymentMethod: data.payment_method as Order["paymentMethod"],
    transferExpiresAt: optionalString(data.transfer_expires_at),
    notes: optionalString(data.notes),
    items: items.map((item) => ({
      productId: String(item.product_id),
      variantId: optionalString(item.variant_id),
      productName: String(item.product_name),
      variantLabel: optionalString(item.variant_label),
      sku: String(item.sku),
      category: item.category as Order["items"][number]["category"],
      platform: (item.platform ??
        undefined) as Order["items"][number]["platform"],
      type: item.type as Order["items"][number]["type"],
      unitPriceCents: Number(item.unit_price_cents),
      originalUnitPriceCents: Number(item.original_unit_price_cents),
      quantity: Number(item.quantity),
      discountCents: Number(item.discount_cents),
      totalCents: Number(item.total_cents),
    })),
    totals: {
      subtotalCents: Number(data.subtotal_cents),
      productDiscountCents: Number(data.product_discount_cents),
      couponDiscountCents: Number(data.coupon_discount_cents),
      shippingCents: Number(data.shipping_cents),
      totalCents: Number(data.total_cents),
    },
    couponCode: optionalString(data.coupon_code),
    status: data.status as Order["status"],
    paymentStatus: data.payment_status as Order["paymentStatus"],
    payments: [],
    statusHistory,
    digitalDelivery,
    transferProofs,
    events,
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
  };
}

function mapTransferProofRow(row: Record<string, unknown>): TransferProof {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    uploadedBy:
      optionalString(row.uploaded_by_clerk_user_id) ??
      optionalString(row.uploaded_by),
    guestEmail: optionalString(row.guest_email),
    storagePath: String(row.storage_path),
    fileName: String(row.original_file_name ?? row.file_name),
    fileSizeBytes: Number(row.file_size_bytes),
    mimeType: String(row.mime_type),
    status: row.status as TransferProof["status"],
    rejectionReason: optionalString(row.rejection_reason),
    reviewedBy:
      optionalString(row.reviewed_by_clerk_user_id) ??
      optionalString(row.reviewed_by),
    reviewedAt: optionalString(row.reviewed_at),
    internalNote: optionalString(row.internal_note),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
