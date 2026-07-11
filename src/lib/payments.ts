import { randomUUID } from "crypto";

import { DEFAULT_SITE_URL } from "@/lib/constants";
import { attachPayment, findOrder, processPaymentEventOnce } from "@/lib/store";
import type { Order, PaymentRecord, PaymentStatus } from "@/lib/types";

type PreferenceResult = {
  provider: "mercadopago" | "development";
  preferenceId: string;
  initPoint: string;
};

export async function createPaymentPreference(
  order: Order,
): Promise<PreferenceResult> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return {
      provider: "development",
      preferenceId: `dev-pref-${order.id}`,
      initPoint: `/pago/resultado?order=${encodeURIComponent(
        order.orderNumber,
      )}&status=pending&mode=development`,
    };
  }

  const { MercadoPagoConfig, Preference } = await import("mercadopago");
  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  const response = await preference.create({
    body: {
      external_reference: order.id,
      items: order.items.map((item) => ({
        id: item.productId,
        title: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPriceCents / 100,
        currency_id: "ARS",
      })),
      payer: {
        name: order.customer.firstName,
        surname: order.customer.lastName,
        email: order.customer.email,
        phone: {
          number: order.customer.phone,
        },
      },
      back_urls: {
        success: `${siteUrl}/pago/resultado?order=${order.orderNumber}&status=success`,
        pending: `${siteUrl}/pago/resultado?order=${order.orderNumber}&status=pending`,
        failure: `${siteUrl}/pago/resultado?order=${order.orderNumber}&status=failure`,
      },
      notification_url: `${siteUrl}/api/payments/mercadopago/webhook`,
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
      },
    },
    requestOptions: {
      idempotencyKey: `order-${order.id}`,
    },
  });

  return {
    provider: "mercadopago",
    preferenceId: response.id ?? `mp-pref-${order.id}`,
    initPoint: response.init_point ?? response.sandbox_init_point ?? siteUrl,
  };
}

export async function verifyMercadoPagoPayment(paymentId: string): Promise<{
  orderId?: string;
  status: PaymentStatus;
  amountCents: number;
  providerPaymentId: string;
}> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN para verificar el pago.");
  }

  const { MercadoPagoConfig, Payment } = await import("mercadopago");
  const client = new MercadoPagoConfig({ accessToken });
  const paymentClient = new Payment(client);
  const payment = await paymentClient.get({ id: paymentId });
  const status = mapMercadoPagoStatus(payment.status);
  const amountCents = Math.round((payment.transaction_amount ?? 0) * 100);
  const orderId =
    typeof payment.external_reference === "string"
      ? payment.external_reference
      : typeof payment.metadata?.order_id === "string"
        ? payment.metadata.order_id
        : undefined;

  return {
    orderId,
    status,
    amountCents,
    providerPaymentId: String(payment.id ?? paymentId),
  };
}

export function mapMercadoPagoStatus(status?: string): PaymentStatus {
  switch (status) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "cancelled":
      return "cancelled";
    case "refunded":
    case "charged_back":
      return "refunded";
    case "in_process":
    case "pending":
    default:
      return "pending";
  }
}

export function processVerifiedPaymentEvent(input: {
  eventId: string;
  orderId: string;
  status: PaymentStatus;
  amountCents: number;
  provider: "mercadopago" | "development";
  providerPaymentId?: string;
  providerPreferenceId?: string;
}): { processed: boolean; order?: Order } {
  return processPaymentEventOnce(input.eventId, () => {
    const order = findOrder(input.orderId);
    if (!order) {
      return undefined;
    }

    const now = new Date().toISOString();
    const payment: PaymentRecord = {
      id: input.providerPaymentId ?? randomUUID(),
      provider: input.provider,
      providerPaymentId: input.providerPaymentId,
      providerPreferenceId: input.providerPreferenceId,
      status: input.status,
      amountCents: input.amountCents,
      rawEventId: input.eventId,
      createdAt: now,
      updatedAt: now,
    };

    return attachPayment(order.id, payment);
  });
}
