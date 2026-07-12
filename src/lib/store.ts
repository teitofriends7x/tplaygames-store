import { randomUUID } from "crypto";

import {
  defaultStoreSettings,
  demoBanners,
  demoCoupons,
  demoProducts,
} from "@/lib/demo-data";
import { applyPaymentStatus, createOrderFromCart } from "@/lib/orders";
import type {
  AuditLog,
  CartItemInput,
  CustomerSnapshot,
  OrderEvent,
  Order,
  PaymentRecord,
  Product,
  Role,
  StoreSettings,
  TransferProof,
  TransferProofStatus,
} from "@/lib/types";

type StoreState = {
  products: Product[];
  coupons: typeof demoCoupons;
  orders: Order[];
  processedPaymentEvents: Set<string>;
  settings: StoreSettings;
  auditLogs: AuditLog[];
  orderEvents: OrderEvent[];
  transferProofs: TransferProof[];
};

const LEGACY_DEMO_PRODUCT_IDS = new Set([
  "prod-console-playstation-demo",
  "prod-console-xbox-demo",
  "prod-console-nintendo-demo",
  "prod-controller-playstation-demo",
  "prod-controller-xbox-demo",
  "prod-controller-nintendo-demo",
  "prod-game-physical-demo",
  "prod-game-digital-demo",
  "prod-game-preorder-demo",
]);

const LEGACY_DEMO_PRODUCT_SLUGS = new Set([
  "consola-playstation-demo",
  "consola-xbox-demo",
  "consola-nintendo-demo",
  "control-playstation-demo",
  "control-xbox-demo",
  "control-nintendo-demo",
  "juego-fisico-demo",
  "juego-digital-demo",
  "juego-preventa-demo",
]);

declare global {
  var __tplaygamesStore: StoreState | undefined;
}

function createInitialState(): StoreState {
  return {
    products: structuredClone(demoProducts),
    coupons: structuredClone(demoCoupons),
    orders: [],
    processedPaymentEvents: new Set(),
    settings: structuredClone(defaultStoreSettings),
    auditLogs: [],
    orderEvents: [],
    transferProofs: [],
  };
}

export function getStoreState(): StoreState {
  if (!globalThis.__tplaygamesStore) {
    globalThis.__tplaygamesStore = createInitialState();
  }

  const latestDemoProducts = new Map(
    demoProducts.map((product) => [product.id, product]),
  );
  const currentDemoIds = new Set(demoProducts.map((product) => product.id));
  const customProducts = globalThis.__tplaygamesStore.products.filter(
    (product) =>
      !currentDemoIds.has(product.id) &&
      !LEGACY_DEMO_PRODUCT_IDS.has(product.id) &&
      !LEGACY_DEMO_PRODUCT_SLUGS.has(product.slug),
  );
  globalThis.__tplaygamesStore.products = [
    ...structuredClone(demoProducts),
    ...customProducts.filter((product) => !latestDemoProducts.has(product.id)),
  ];
  globalThis.__tplaygamesStore.settings = {
    ...structuredClone(defaultStoreSettings),
    ...globalThis.__tplaygamesStore.settings,
    paymentMethods: {
      ...defaultStoreSettings.paymentMethods,
      ...globalThis.__tplaygamesStore.settings.paymentMethods,
    },
    provinceShippingCents: {
      ...defaultStoreSettings.provinceShippingCents,
      ...globalThis.__tplaygamesStore.settings.provinceShippingCents,
    },
  };

  return globalThis.__tplaygamesStore;
}

export function resetDemoStore(): void {
  globalThis.__tplaygamesStore = createInitialState();
}

export function listProducts(): Product[] {
  return getStoreState().products;
}

export function upsertProduct(product: Product, actorRole: Role): Product {
  const state = getStoreState();
  const index = state.products.findIndex((item) => item.id === product.id);
  const nextProduct = {
    ...product,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    state.products[index] = nextProduct;
  } else {
    state.products.unshift(nextProduct);
  }

  logAudit(actorRole, "product.upsert", "products", nextProduct.id, {
    slug: nextProduct.slug,
  });

  return nextProduct;
}

export function createOrder(input: {
  items: CartItemInput[];
  customer: CustomerSnapshot;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    notes?: string;
  };
  notes?: string;
  couponCode?: string;
  paymentMethod?: "mercadopago" | "transfer";
  termsAccepted: boolean;
  userId?: string;
}): Order {
  const state = getStoreState();
  const order = createOrderFromCart({
    ...input,
    province: input.address?.province,
    products: state.products,
    settings: state.settings,
  });
  state.orders.unshift(order);
  logAudit("customer", "order.create", "orders", order.id, {
    orderNumber: order.orderNumber,
  });
  addOrderEvent({
    orderId: order.id,
    eventType: "order_created",
    actorId: input.userId,
    actorRole: input.userId ? "customer" : undefined,
    payload: {
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod ?? "mercadopago",
      totalCents: order.totals.totalCents,
    },
    internalNote: "Pedido creado desde checkout.",
  });

  return order;
}

export function listOrders(): Order[] {
  return getStoreState().orders;
}

export function findOrder(idOrNumber: string): Order | undefined {
  return getStoreState().orders.find(
    (order) => order.id === idOrNumber || order.orderNumber === idOrNumber,
  );
}

export function replaceOrder(order: Order): Order {
  const state = getStoreState();
  const index = state.orders.findIndex((entry) => entry.id === order.id);

  if (index >= 0) {
    state.orders[index] = order;
  } else {
    state.orders.unshift(order);
  }

  return order;
}

export function findOrderForCustomer(
  idOrNumber: string,
  email?: string,
  userId?: string,
): Order | undefined {
  return getStoreState().orders.find((order) => {
    const matchesIdentifier =
      order.id === idOrNumber || order.orderNumber === idOrNumber;
    if (!matchesIdentifier) return false;
    if (userId && order.userId === userId) return true;
    if (email) {
      return (
        order.customer.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
    }
    return false;
  });
}

export function listOrdersByCustomer(options: {
  userId?: string;
  email?: string;
}): Order[] {
  const normalizedEmail = options.email?.toLowerCase().trim();

  return getStoreState().orders.filter((order) => {
    if (options.userId && order.userId === options.userId) {
      return true;
    }

    return normalizedEmail
      ? order.customer.email.toLowerCase().trim() === normalizedEmail
      : false;
  });
}

export function addOrderEvent(
  event: Omit<OrderEvent, "id" | "createdAt"> & { createdAt?: string },
): OrderEvent {
  const next: OrderEvent = {
    id: randomUUID(),
    createdAt: event.createdAt ?? new Date().toISOString(),
    ...event,
  };
  getStoreState().orderEvents.unshift(next);

  return next;
}

export function listOrderEvents(orderId: string): OrderEvent[] {
  return getStoreState()
    .orderEvents.filter((event) => event.orderId === orderId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function addTransferProof(
  proof: Omit<TransferProof, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  },
): TransferProof {
  const now = new Date().toISOString();
  const next: TransferProof = {
    ...proof,
    id: proof.id ?? randomUUID(),
    createdAt: proof.createdAt ?? now,
    updatedAt: proof.updatedAt ?? now,
  };
  getStoreState().transferProofs.unshift(next);

  return next;
}

export function listTransferProofs(orderId: string): TransferProof[] {
  return getStoreState()
    .transferProofs.filter((proof) => proof.orderId === orderId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function updateTransferProofStatus(
  proofId: string,
  status: TransferProofStatus,
  options: {
    reviewedBy?: string;
    rejectionReason?: string;
    internalNote?: string;
  } = {},
): TransferProof {
  const state = getStoreState();
  const index = state.transferProofs.findIndex((proof) => proof.id === proofId);
  if (index < 0) {
    throw new Error("Comprobante no encontrado.");
  }

  const now = new Date().toISOString();
  const updated = {
    ...state.transferProofs[index],
    status,
    reviewedBy: options.reviewedBy,
    rejectionReason: options.rejectionReason,
    internalNote: options.internalNote,
    reviewedAt: now,
    updatedAt: now,
  };
  state.transferProofs[index] = updated;

  return updated;
}

export function attachPayment(orderId: string, payment: PaymentRecord): Order {
  const order = findOrder(orderId);
  if (!order) {
    throw new Error("Pedido no encontrado.");
  }

  const existingIndex = order.payments.findIndex(
    (item) => item.id === payment.id,
  );
  const payments = [...order.payments];
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }

  const updatedOrder = applyPaymentStatus(
    { ...order, payments },
    payment.status,
  );
  replaceOrder(updatedOrder);

  return updatedOrder;
}

export function processPaymentEventOnce(
  eventId: string,
  handler: () => Order | undefined,
): { processed: boolean; order?: Order } {
  const state = getStoreState();
  if (state.processedPaymentEvents.has(eventId)) {
    return { processed: false };
  }

  state.processedPaymentEvents.add(eventId);
  return { processed: true, order: handler() };
}

export function logAudit(
  actorRole: Role,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
): AuditLog {
  const log: AuditLog = {
    id: randomUUID(),
    actorRole,
    action,
    entity,
    entityId,
    createdAt: new Date().toISOString(),
    metadata,
  };
  getStoreState().auditLogs.unshift(log);

  return log;
}

export function getDashboardMetrics() {
  const state = getStoreState();
  const orders = state.orders;
  const approvedOrders = orders.filter(
    (order) => order.paymentStatus === "approved",
  );

  return {
    salesCents: approvedOrders.reduce(
      (total, order) => total + order.totals.totalCents,
      0,
    ),
    pendingOrders: orders.filter((order) => order.status === "pending_payment")
      .length,
    paidOrders: approvedOrders.length,
    digitalPending: orders.filter(
      (order) => order.status === "digital_delivery_pending",
    ).length,
    shippingPending: orders.filter((order) =>
      ["paid", "preparing"].includes(order.status),
    ).length,
    lowStock: state.products.filter(
      (product) => product.stock <= product.lowStockThreshold,
    ),
    outOfStock: state.products.filter((product) => product.stock <= 0),
    topProducts: state.products.slice(0, 5),
  };
}

export function listBanners() {
  return demoBanners.filter((banner) => banner.active);
}
