import { randomUUID } from "crypto";

import { calculateCart } from "@/lib/cart";
import type {
  AddressSnapshot,
  CartItemInput,
  CustomerSnapshot,
  DeliveryMethod,
  DigitalDelivery,
  Order,
  OrderItemSnapshot,
  OrderStatus,
  PaymentStatus,
  Product,
  Role,
  StoreSettings,
} from "@/lib/types";

export type CreateOrderInput = {
  items: CartItemInput[];
  customer: CustomerSnapshot;
  address?: AddressSnapshot;
  province?: string;
  notes?: string;
  couponCode?: string;
  termsAccepted: boolean;
  userId?: string;
  products: Product[];
  settings: StoreSettings;
};

export function createOrderFromCart(input: CreateOrderInput): Order {
  if (!input.termsAccepted) {
    throw new Error("Debe aceptar los terminos y condiciones.");
  }

  const cart = calculateCart({
    items: input.items,
    couponCode: input.couponCode,
    province: input.province ?? input.address?.province,
    products: input.products,
    settings: input.settings,
  });

  if (!cart.lines.length) {
    throw new Error("El carrito no tiene productos disponibles.");
  }

  if (cart.hasPhysicalItems && !input.address?.street) {
    throw new Error("El domicilio es obligatorio para productos fisicos.");
  }

  const deliveryMethod: DeliveryMethod =
    cart.hasPhysicalItems && cart.hasDigitalItems
      ? "mixed"
      : cart.hasPhysicalItems
        ? "shipping"
        : "digital";
  const createdAt = new Date().toISOString();
  const status: OrderStatus = "pending_payment";
  const orderId = randomUUID();
  const items: OrderItemSnapshot[] = cart.lines.map((line) => ({
    productId: line.product.id,
    variantId: line.variant?.id,
    productName: line.product.name,
    variantLabel: line.variant?.label,
    sku: line.variant?.sku ?? line.product.sku,
    category: line.product.category,
    platform: line.variant?.platform ?? line.product.platform,
    type: line.variant?.format ?? line.product.type,
    unitPriceCents: line.unitPriceCents,
    originalUnitPriceCents: line.originalUnitPriceCents,
    quantity: line.quantity,
    discountCents: line.lineDiscountCents,
    totalCents: line.lineTotalCents,
  }));

  return {
    id: orderId,
    orderNumber: buildOrderNumber(createdAt),
    userId: input.userId,
    customer: input.customer,
    address: input.address,
    deliveryMethod,
    notes: input.notes,
    items,
    totals: cart.totals,
    couponCode: cart.coupon?.code,
    status,
    paymentStatus: "pending",
    payments: [],
    statusHistory: [
      {
        id: randomUUID(),
        status,
        createdAt,
        actorId: input.userId,
        actorRole: input.userId ? "customer" : undefined,
        internalComment: "Pedido creado desde checkout.",
      },
    ],
    createdAt,
    updatedAt: createdAt,
  };
}

export function transitionOrderStatus(
  order: Order,
  status: OrderStatus,
  actor: { id?: string; role?: Role },
  internalComment?: string,
): Order {
  const now = new Date().toISOString();

  return {
    ...order,
    status,
    updatedAt: now,
    statusHistory: [
      ...order.statusHistory,
      {
        id: randomUUID(),
        status,
        createdAt: now,
        actorId: actor.id,
        actorRole: actor.role,
        internalComment,
      },
    ],
  };
}

export function applyPaymentStatus(
  order: Order,
  paymentStatus: PaymentStatus,
): Order {
  const targetStatus = mapPaymentToOrderStatus(order, paymentStatus);
  const updated = {
    ...order,
    paymentStatus,
    updatedAt: new Date().toISOString(),
  };

  if (targetStatus && targetStatus !== order.status) {
    return transitionOrderStatus(
      updated,
      targetStatus,
      { role: "operator" },
      "Estado actualizado por evento de pago verificado.",
    );
  }

  return updated;
}

export function mapPaymentToOrderStatus(
  order: Order,
  paymentStatus: PaymentStatus,
): OrderStatus | undefined {
  if (paymentStatus === "approved") {
    const hasDigital = order.items.some((item) => item.type === "digital");
    const hasPhysical = order.items.some((item) => item.type === "physical");

    if (hasDigital && !hasPhysical) {
      return "digital_delivery_pending";
    }

    if (hasDigital && hasPhysical) {
      return "digital_delivery_pending";
    }

    return "paid";
  }

  if (paymentStatus === "rejected" || paymentStatus === "cancelled") {
    return "cancelled";
  }

  if (paymentStatus === "refunded") {
    return "refunded";
  }

  if (paymentStatus === "pending") {
    return "pending_payment";
  }

  return undefined;
}

export function registerDigitalDelivery(
  order: Order,
  delivery: Omit<DigitalDelivery, "id" | "orderId" | "deliveredAt">,
): Order {
  if (!order.items.some((item) => item.type === "digital")) {
    throw new Error("El pedido no contiene productos digitales.");
  }

  if (order.paymentStatus !== "approved") {
    throw new Error(
      "No se puede entregar un producto digital sin pago aprobado.",
    );
  }

  const now = new Date().toISOString();
  const secureDelivery: DigitalDelivery = {
    id: randomUUID(),
    orderId: order.id,
    deliveredAt: now,
    ...delivery,
  };

  return transitionOrderStatus(
    {
      ...order,
      digitalDelivery: secureDelivery,
      updatedAt: now,
    },
    "digital_delivery_done",
    { id: delivery.deliveredBy, role: "operator" },
    "Entrega digital registrada manualmente.",
  );
}

export function buildOrderNumber(dateIso: string): string {
  const date = new Date(dateIso);
  const stamp = new Intl.DateTimeFormat("es-AR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  })
    .format(date)
    .replace(/\D/g, "");

  return `TPG-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
