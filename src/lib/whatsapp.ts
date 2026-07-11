import { DEFAULT_SITE_URL, WHATSAPP_NUMBER } from "@/lib/constants";
import type { Order, Product } from "@/lib/types";
import { formatARS } from "@/lib/money";

function buildWhatsappUrl(message: string): string {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");
  if (!number) {
    return "/contacto";
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function whatsappGeneralUrl(): string {
  return buildWhatsappUrl(
    "Hola, vi T.PlayGames y quiero hacer una consulta.",
  );
}

export function whatsappProductUrl(product: Product): string {
  return buildWhatsappUrl(
    `Hola, quiero consultar por ${product.name}. Vi el producto en T.PlayGames: ${DEFAULT_SITE_URL}/catalogo/${product.slug}`,
  );
}

export function whatsappOrderUrl(order: Order): string {
  return buildWhatsappUrl(
    `Hola, quiero consultar por mi pedido ${order.orderNumber}.`,
  );
}

export function whatsappDigitalDeliveryUrl(order: Order): string {
  return buildWhatsappUrl(
    `Hola, quiero consultar por la entrega digital del pedido ${order.orderNumber}.`,
  );
}

export function whatsappTransferReceiptUrl(order: Order): string {
  return buildWhatsappUrl(
    `Hola, realicé una transferencia por el pedido ${order.orderNumber} de T.PlayGames por un total de ${formatARS(order.totals.totalCents)}. Quiero enviar el comprobante.`,
  );
}

export function whatsappShippingUrl(order: Order): string {
  return buildWhatsappUrl(
    `Hola, quiero consultar por el envío de mi pedido ${order.orderNumber}.`,
  );
}
