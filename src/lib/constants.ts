export const STORE_NAME = "T.PlayGames";
export const STORE_TAGLINE = "Jugá más. Pagá menos.";
export const LOCALE = "es-AR";
export const CURRENCY = "ARS";
export const TIME_ZONE = "America/Argentina/Buenos_Aires";

export const CATEGORIES = ["Consolas", "Controles", "Juegos"] as const;
export const PLATFORMS = ["PlayStation", "Xbox", "Nintendo", "PC"] as const;
export const PRODUCT_TYPES = ["physical", "digital"] as const;
export const PRODUCT_CONDITIONS = ["new", "used", "refurbished"] as const;
export const PRODUCT_PUBLICATION_STATUSES = [
  "draft",
  "published",
  "paused",
  "deleted",
] as const;
export const ROLES = ["customer", "operator", "admin"] as const;

export const ORDER_STATUSES = [
  "draft",
  "pending_payment",
  "payment_review",
  "paid",
  "preparing",
  "ready_for_pickup",
  "shipped",
  "delivered",
  "digital_delivery_pending",
  "digital_delivery_done",
  "cancelled",
  "refunded",
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "refunded",
] as const;

export const STATUS_LABELS: Record<(typeof ORDER_STATUSES)[number], string> = {
  draft: "Borrador",
  pending_payment: "Pendiente de pago",
  payment_review: "Pago en revision",
  paid: "Pagado",
  preparing: "Preparando",
  ready_for_pickup: "Listo para retirar",
  shipped: "Enviado",
  delivered: "Entregado",
  digital_delivery_pending: "Entrega digital pendiente",
  digital_delivery_done: "Entrega digital realizada",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const PAYMENT_STATUS_LABELS: Record<
  (typeof PAYMENT_STATUSES)[number],
  string
> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const PRODUCT_TYPE_LABELS: Record<
  (typeof PRODUCT_TYPES)[number],
  string
> = {
  physical: "Físico",
  digital: "Digital",
};

export const PRODUCT_CONDITION_LABELS: Record<
  (typeof PRODUCT_CONDITIONS)[number],
  string
> = {
  new: "Nuevo",
  used: "Usado",
  refurbished: "Reacondicionado",
};

export const CATEGORY_ASSETS: Record<
  (typeof CATEGORIES)[number],
  { image: string; href: string; description: string }
> = {
  Consolas: {
    image: "/brand/categories/consolas.svg",
    href: "/consolas",
    description: "Equipos para jugar en casa con stock validado.",
  },
  Controles: {
    image: "/brand/categories/controles.svg",
    href: "/controles",
    description: "Mandos y accesorios de control para cada plataforma.",
  },
  Juegos: {
    image: "/brand/categories/juegos.svg",
    href: "/juegos",
    description: "Juegos físicos y digitales con entrega clara.",
  },
};

export const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
