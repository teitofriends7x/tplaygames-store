import { DEFAULT_SITE_URL, WHATSAPP_NUMBER } from "@/lib/constants";
import type { Order, Product } from "@/lib/types";

function buildWhatsappUrl(message: string): string {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");
  if (!number) {
    return "/contacto";
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function whatsappGeneralUrl(): string {
  return buildWhatsappUrl("Hola T.PlayGames, quiero hacer una consulta.");
}

export function whatsappProductUrl(product: Product): string {
  return buildWhatsappUrl(
    `Hola T.PlayGames, quiero consultar por ${product.name}: ${DEFAULT_SITE_URL}/catalogo/${product.slug}`,
  );
}

export function whatsappOrderUrl(order: Order): string {
  return buildWhatsappUrl(
    `Hola T.PlayGames, quiero consultar por mi pedido ${order.orderNumber}.`,
  );
}

export function whatsappDigitalDeliveryUrl(order: Order): string {
  return buildWhatsappUrl(
    `Hola T.PlayGames, quiero consultar por la entrega digital del pedido ${order.orderNumber}.`,
  );
}
