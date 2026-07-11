import { describe, expect, it, beforeEach } from "vitest";

import { canManageRole, roleCanAccess } from "@/lib/authz";
import { calculateCart } from "@/lib/cart";
import {
  demoCoupons,
  demoProducts,
  defaultStoreSettings,
} from "@/lib/demo-data";
import {
  applyPaymentStatus,
  createOrderFromCart,
  registerDigitalDelivery,
} from "@/lib/orders";
import {
  mapMercadoPagoStatus,
  processVerifiedPaymentEvent,
} from "@/lib/payments";
import {
  attachPayment,
  createOrder,
  findOrder,
  resetDemoStore,
} from "@/lib/store";

const physicalItem = { productId: "prod-game-physical-demo", quantity: 2 };
const digitalItem = {
  productId: "prod-game-digital-demo",
  variantId: "var-game-digital-pc",
  quantity: 1,
};

const customer = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "1122334455",
};

describe("carrito y precios", () => {
  it("recalcula precios desde productos y aplica descuentos promocionales", () => {
    const cart = calculateCart({
      items: [physicalItem],
      products: demoProducts,
      settings: defaultStoreSettings,
    });

    expect(cart.lines[0]?.unitPriceCents).toBe(6_400_000);
    expect(cart.totals.productDiscountCents).toBe(1_600_000);
    expect(cart.totals.totalCents).toBeGreaterThan(0);
  });

  it("aplica cupon valido y respeta compra minima", () => {
    const cart = calculateCart({
      items: [physicalItem],
      couponCode: "DEMO10",
      products: demoProducts,
      coupons: demoCoupons,
      settings: defaultStoreSettings,
    });

    expect(cart.coupon?.code).toBe("DEMO10");
    expect(cart.totals.couponDiscountCents).toBeGreaterThan(0);
  });

  it("mantiene total y emite advertencia con cupon invalido", () => {
    const cart = calculateCart({
      items: [physicalItem],
      couponCode: "NOEXISTE",
      products: demoProducts,
      coupons: demoCoupons,
      settings: defaultStoreSettings,
    });

    expect(cart.coupon).toBeUndefined();
    expect(cart.totals.couponDiscountCents).toBe(0);
    expect(cart.warnings.some((warning) => /cupón/i.test(warning))).toBe(true);
  });

  it("ajusta cantidades al stock disponible", () => {
    const cart = calculateCart({
      items: [{ productId: "prod-game-physical-demo", quantity: 999 }],
      products: demoProducts,
      settings: defaultStoreSettings,
    });

    expect(cart.lines[0]?.quantity).toBe(20);
    expect(cart.warnings.some((warning) => warning.includes("stock"))).toBe(
      true,
    );
  });
});

describe("pedidos", () => {
  it("crea snapshot historico para carrito mixto", () => {
    const order = createOrderFromCart({
      items: [physicalItem, digitalItem],
      customer,
      address: {
        street: "Av. Siempre Viva 123",
        city: "CABA",
        province: "CABA",
        postalCode: "1000",
      },
      termsAccepted: true,
      products: demoProducts,
      settings: defaultStoreSettings,
    });

    expect(order.deliveryMethod).toBe("mixed");
    expect(order.items).toHaveLength(2);
    expect(order.items[0]?.productName).toContain("demo");
  });

  it("impide checkout fisico sin domicilio", () => {
    expect(() =>
      createOrderFromCart({
        items: [physicalItem],
        customer,
        termsAccepted: true,
        products: demoProducts,
        settings: defaultStoreSettings,
      }),
    ).toThrow(/domicilio/i);
  });

  it("pasa digital aprobado a entrega pendiente y registra entrega manual", () => {
    const order = createOrderFromCart({
      items: [digitalItem],
      customer,
      termsAccepted: true,
      products: demoProducts,
      settings: defaultStoreSettings,
    });
    const paid = applyPaymentStatus(order, "approved");

    expect(paid.status).toBe("digital_delivery_pending");

    const delivered = registerDigitalDelivery(paid, {
      channel: "manual",
      deliveredBy: "operator-test",
      internalNote: "Entregado por prueba",
      secureReference: "Referencia segura",
    });

    expect(delivered.status).toBe("digital_delivery_done");
    expect(delivered.digitalDelivery?.secureReference).toBe(
      "Referencia segura",
    );
  });
});

describe("autorizacion", () => {
  it("permite admin y operador en endpoints operativos", () => {
    expect(roleCanAccess("admin", ["admin", "operator"])).toBe(true);
    expect(roleCanAccess("operator", ["admin", "operator"])).toBe(true);
    expect(roleCanAccess("customer", ["admin", "operator"])).toBe(false);
  });

  it("solo admin puede administrar roles criticos", () => {
    expect(canManageRole("admin", "operator")).toBe(true);
    expect(canManageRole("operator", "admin")).toBe(false);
  });
});

describe("pagos", () => {
  beforeEach(() => resetDemoStore());

  it("mapea estados de Mercado Pago", () => {
    expect(mapMercadoPagoStatus("approved")).toBe("approved");
    expect(mapMercadoPagoStatus("charged_back")).toBe("refunded");
    expect(mapMercadoPagoStatus("in_process")).toBe("pending");
  });

  it("procesa webhook de forma idempotente", () => {
    const order = createOrder({
      items: [digitalItem],
      customer,
      termsAccepted: true,
    });
    const first = processVerifiedPaymentEvent({
      eventId: "evt-1",
      orderId: order.id,
      status: "approved",
      amountCents: order.totals.totalCents,
      provider: "development",
      providerPaymentId: "pay-1",
    });
    const second = processVerifiedPaymentEvent({
      eventId: "evt-1",
      orderId: order.id,
      status: "approved",
      amountCents: order.totals.totalCents,
      provider: "development",
      providerPaymentId: "pay-1",
    });

    expect(first.processed).toBe(true);
    expect(second.processed).toBe(false);
    expect(findOrder(order.id)?.payments).toHaveLength(1);
  });

  it("actualiza pagos asociados al pedido", () => {
    const order = createOrder({
      items: [digitalItem],
      customer,
      termsAccepted: true,
    });
    attachPayment(order.id, {
      id: "pay-2",
      provider: "development",
      status: "approved",
      amountCents: order.totals.totalCents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(findOrder(order.id)?.paymentStatus).toBe("approved");
  });
});
