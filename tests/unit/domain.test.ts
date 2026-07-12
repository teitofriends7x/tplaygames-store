import { describe, expect, it, beforeEach } from "vitest";

import { canManageRole, roleCanAccess } from "@/lib/authz";
import { mergeCartItems, mergeFavoriteIds } from "@/lib/account-sync";
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
  addTransferProof,
  attachPayment,
  createOrder,
  findOrder,
  listTransferProofs,
  resetDemoStore,
  updateTransferProofStatus,
} from "@/lib/store";
import {
  buildTransferProofStoragePath,
  TRANSFER_PROOF_MAX_BYTES,
  validateTransferProofFile,
} from "@/lib/transfer-proofs";

const physicalItem = {
  productId: "prod-game-god-of-war-ragnarok",
  quantity: 2,
};
const digitalItem = {
  productId: "prod-game-forza-horizon-5",
  variantId: "var-forza-horizon-5-xbox-digital",
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

    expect(cart.lines[0]?.unitPriceCents).toBe(6_900_000);
    expect(cart.totals.productDiscountCents).toBe(0);
    expect(cart.totals.totalCents).toBeGreaterThan(0);
  });

  it("aplica precio por transferencia cuando se selecciona ese metodo", () => {
    const cart = calculateCart({
      items: [physicalItem],
      products: demoProducts,
      settings: defaultStoreSettings,
      paymentMethod: "transfer",
    });

    expect(cart.lines[0]?.unitPriceCents).toBe(6_200_000);
    expect(cart.totals.productDiscountCents).toBe(1_400_000);
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
      items: [{ productId: "prod-game-god-of-war-ragnarok", quantity: 999 }],
      products: demoProducts,
      settings: defaultStoreSettings,
    });

    expect(cart.lines[0]?.quantity).toBe(16);
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
    expect(order.items[0]?.productName).toBe("God of War Ragnarok");
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

  it("registra comprobante de transferencia en el store local", () => {
    resetDemoStore();
    const order = createOrder({
      items: [physicalItem],
      customer,
      address: {
        street: "Av. Corrientes 1234",
        city: "CABA",
        province: "CABA",
        postalCode: "1043",
      },
      paymentMethod: "transfer",
      termsAccepted: true,
    });

    const proof = addTransferProof({
      orderId: order.id,
      storagePath: "development://proof.pdf",
      fileName: "proof.pdf",
      fileSizeBytes: 128,
      mimeType: "application/pdf",
      status: "pending",
    });

    expect(listTransferProofs(order.id)).toHaveLength(1);
    expect(proof.status).toBe("pending");
  });

  it("actualiza revision de comprobante de transferencia", () => {
    resetDemoStore();
    const order = createOrder({
      items: [physicalItem],
      customer,
      address: {
        street: "Av. Corrientes 1234",
        city: "CABA",
        province: "CABA",
        postalCode: "1043",
      },
      paymentMethod: "transfer",
      termsAccepted: true,
    });
    const proof = addTransferProof({
      orderId: order.id,
      storagePath: "development://proof.pdf",
      fileName: "proof.pdf",
      fileSizeBytes: 128,
      mimeType: "application/pdf",
      status: "pending",
    });

    const updated = updateTransferProofStatus(proof.id, "rejected", {
      reviewedBy: "operator",
      rejectionReason: "Archivo ilegible",
    });

    expect(updated.status).toBe("rejected");
    expect(updated.rejectionReason).toMatch(/ilegible/i);
  });
});

describe("cuenta y sincronizacion", () => {
  it("fusiona carrito local y remoto acumulando cantidades", () => {
    const merged = mergeCartItems(
      [{ productId: "p1", quantity: 2 }],
      [
        { productId: "p1", quantity: 3 },
        { productId: "p2", variantId: "v1", quantity: 1 },
      ],
    );

    expect(merged).toContainEqual({ productId: "p1", quantity: 5 });
    expect(merged).toContainEqual({
      productId: "p2",
      variantId: "v1",
      quantity: 1,
    });
  });

  it("fusiona favoritos sin duplicados", () => {
    expect(mergeFavoriteIds(["p1", "p2"], ["p2", "p3"])).toEqual([
      "p2",
      "p3",
      "p1",
    ]);
  });
});

describe("comprobantes de transferencia", () => {
  it("acepta JPG cuando extension, MIME y firma coinciden", () => {
    const result = validateTransferProofFile({
      fileName: "comprobante.jpg",
      mimeType: "image/jpeg",
      size: 4,
      bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
    });

    expect(result.ok).toBe(true);
    expect(result.mimeType).toBe("image/jpeg");
  });

  it("rechaza archivos con firma real distinta al MIME declarado", () => {
    const result = validateTransferProofFile({
      fileName: "comprobante.png",
      mimeType: "image/png",
      size: 4,
      bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/coinciden/i);
  });

  it("rechaza comprobantes mayores a 10 MB", () => {
    const result = validateTransferProofFile({
      fileName: "comprobante.pdf",
      mimeType: "application/pdf",
      size: TRANSFER_PROOF_MAX_BYTES + 1,
      bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/10 MB/i);
  });

  it("rechaza firmas desconocidas aunque la extension sea permitida", () => {
    const result = validateTransferProofFile({
      fileName: "comprobante.pdf",
      mimeType: "application/pdf",
      size: 4,
      bytes: new Uint8Array([0x00, 0x11, 0x22, 0x33]),
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/tipo real/i);
  });

  it("genera rutas de storage sin caracteres peligrosos", () => {
    const storagePath = buildTransferProofStoragePath({
      orderId: "order/../../123",
      fileName: "comprobante final julio.pdf",
      extension: ".pdf",
    });

    expect(storagePath).toMatch(/^order123\/.+comprobante-final-julio\.pdf$/);
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
