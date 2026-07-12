import type {
  CATEGORIES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PLATFORMS,
  PRODUCT_CONDITIONS,
  PRODUCT_PUBLICATION_STATUSES,
  PRODUCT_TYPES,
  ROLES,
} from "@/lib/constants";

export type CategoryName = (typeof CATEGORIES)[number];
export type PlatformName = (typeof PLATFORMS)[number];
export type ProductType = (typeof PRODUCT_TYPES)[number];
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];
export type PublicationStatus = (typeof PRODUCT_PUBLICATION_STATUSES)[number];
export type ProductAvailabilityStatus =
  "available" | "preorder" | "out_of_stock";
export type Role = (typeof ROLES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type TransferProofStatus = "pending" | "approved" | "rejected";

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  position: number;
  isPrimary: boolean;
  blurDataUrl?: string;
  width?: number;
  height?: number;
};

export type ProductVariant = {
  id: string;
  sku: string;
  label: string;
  color?: string;
  capacity?: string;
  edition?: string;
  platform?: PlatformName;
  format?: ProductType;
  condition?: ProductCondition;
  region?: string;
  priceCents?: number;
  stock: number;
  imageUrl?: string;
  available: boolean;
};

export type ProductSpecification = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: CategoryName;
  platform?: PlatformName;
  type: ProductType;
  condition: ProductCondition;
  brand: string;
  model: string;
  priceCents: number;
  promoPriceCents?: number;
  internalCostCents?: number;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  images: ProductImage[];
  mainImage: string;
  features: string[];
  warranty: string;
  deliveryTerms: string;
  availabilityStatus?: ProductAvailabilityStatus;
  releaseDate?: string;
  releaseDateLabel?: string;
  publicationStatus: PublicationStatus;
  featured: boolean;
  offer: boolean;
  transferEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  specifications?: ProductSpecification[];
  variants: ProductVariant[];
  demo: boolean;
};

export type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchaseCents: number;
  startsAt: string;
  endsAt?: string;
  totalLimit?: number;
  perCustomerLimit?: number;
  applicableCategories?: CategoryName[];
  applicableProducts?: string[];
  firstPurchaseOnly?: boolean;
  active: boolean;
  redemptions: number;
};

export type CartItemInput = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type CartLine = {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPriceCents: number;
  originalUnitPriceCents: number;
  lineSubtotalCents: number;
  lineDiscountCents: number;
  lineTotalCents: number;
  isPhysical: boolean;
  availableStock: number;
};

export type CartTotals = {
  subtotalCents: number;
  productDiscountCents: number;
  couponDiscountCents: number;
  shippingCents: number;
  totalCents: number;
};

export type CartCalculation = {
  lines: CartLine[];
  totals: CartTotals;
  coupon?: Coupon;
  warnings: string[];
  hasPhysicalItems: boolean;
  hasDigitalItems: boolean;
};

export type CustomerSnapshot = {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document?: string;
};

export type AddressSnapshot = {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  notes?: string;
};

export type DeliveryMethod = "shipping" | "digital" | "mixed" | "pickup";

export type OrderItemSnapshot = {
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel?: string;
  sku: string;
  category: CategoryName;
  platform?: PlatformName;
  type: ProductType;
  unitPriceCents: number;
  originalUnitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
};

export type OrderStatusEvent = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  actorId?: string;
  actorRole?: Role;
  internalComment?: string;
};

export type OrderEvent = {
  id: string;
  orderId: string;
  eventType: string;
  actorId?: string;
  actorRole?: Role;
  payload?: Record<string, unknown>;
  internalNote?: string;
  createdAt: string;
};

export type TransferProof = {
  id: string;
  orderId: string;
  uploadedBy?: string;
  guestEmail?: string;
  storagePath: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  status: TransferProofStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  internalNote?: string;
  signedUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  provider: "mercadopago" | "development";
  providerPaymentId?: string;
  providerPreferenceId?: string;
  status: PaymentStatus;
  amountCents: number;
  rawEventId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Shipment = {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
};

export type DigitalDelivery = {
  id: string;
  orderId: string;
  secureReference: string;
  internalNote: string;
  deliveredBy: string;
  deliveredAt: string;
  channel: "email" | "whatsapp" | "manual";
};

export type Order = {
  id: string;
  orderNumber: string;
  userId?: string;
  customer: CustomerSnapshot;
  address?: AddressSnapshot;
  deliveryMethod: DeliveryMethod;
  paymentMethod?: PaymentMethod;
  transferExpiresAt?: string;
  notes?: string;
  items: OrderItemSnapshot[];
  totals: CartTotals;
  couponCode?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  payments: PaymentRecord[];
  statusHistory: OrderStatusEvent[];
  shipment?: Shipment;
  digitalDelivery?: DigitalDelivery;
  transferProofs?: TransferProof[];
  events?: OrderEvent[];
  createdAt: string;
  updatedAt: string;
};

export type AccountProfile = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  addressNotes?: string;
};

export type Banner = {
  id: string;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  active: boolean;
};

export type TransferAccount = {
  alias: string;
  cvu: string;
  accountHolder: string;
};

export type StoreSettings = {
  pickupEnabled: boolean;
  pickupLabel?: string;
  freeShippingFromCents: number;
  defaultShippingCents: number;
  provinceShippingCents: Record<string, number>;
  whatsappNumber?: string;
  digitalDeliveryChannel: "email" | "whatsapp" | "manual";
  paymentMethods: {
    mercadoPago: boolean;
    transfer: boolean;
  };
  transferAccount?: TransferAccount;
  transferExpirationHours: number;
  transferDiscountPercent?: number;
  installments?: {
    label: string;
    active: boolean;
  }[];
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
  };
};

export type AuditLog = {
  id: string;
  actorId?: string;
  actorRole?: Role;
  action: string;
  entity: string;
  entityId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};
