import { getProductStock, getVariantPrice } from "@/lib/catalog";
import { demoCoupons, defaultStoreSettings } from "@/lib/demo-data";
import { clampCents } from "@/lib/money";
import { validateCoupon } from "@/lib/coupons";
import type {
  CartCalculation,
  CartItemInput,
  CartLine,
  Coupon,
  Product,
  StoreSettings,
} from "@/lib/types";

export type CalculateCartOptions = {
  items: CartItemInput[];
  couponCode?: string;
  province?: string;
  products: Product[];
  coupons?: Coupon[];
  settings?: StoreSettings;
  isFirstPurchase?: boolean;
};

export function normalizeCartItems(items: CartItemInput[]): CartItemInput[] {
  const grouped = new Map<string, CartItemInput>();

  for (const item of items) {
    const quantity = Math.max(1, Math.min(99, Math.floor(item.quantity || 1)));
    const key = `${item.productId}:${item.variantId ?? ""}`;
    const current = grouped.get(key);

    if (current) {
      current.quantity = Math.min(99, current.quantity + quantity);
    } else {
      grouped.set(key, {
        productId: item.productId,
        variantId: item.variantId,
        quantity,
      });
    }
  }

  return [...grouped.values()];
}

export function calculateCart({
  items,
  couponCode,
  province,
  products,
  coupons = demoCoupons,
  settings = defaultStoreSettings,
  isFirstPurchase,
}: CalculateCartOptions): CartCalculation {
  const warnings: string[] = [];
  const lines: CartLine[] = [];

  for (const item of normalizeCartItems(items)) {
    const product = products.find((entry) => entry.id === item.productId);

    if (!product || product.publicationStatus !== "published") {
      warnings.push("Un producto del carrito ya no esta disponible.");
      continue;
    }

    const variant = product.variants.find((entry) => entry.id === item.variantId);
    if (item.variantId && (!variant || !variant.available)) {
      warnings.push(`${product.name}: la variante seleccionada no esta disponible.`);
      continue;
    }

    const availableStock = getProductStock(product, variant?.id);
    if (availableStock <= 0) {
      warnings.push(`${product.name} no tiene stock disponible.`);
      continue;
    }

    const quantity = Math.min(item.quantity, availableStock);
    if (quantity < item.quantity) {
      warnings.push(
        `${product.name}: cantidad ajustada al stock disponible (${availableStock}).`,
      );
    }

    const originalUnitPriceCents = product.priceCents;
    const unitPriceCents = getVariantPrice(product, variant?.id);
    const lineSubtotalCents = originalUnitPriceCents * quantity;
    const lineTotalCents = unitPriceCents * quantity;
    const lineDiscountCents = Math.max(0, lineSubtotalCents - lineTotalCents);
    const isPhysical = (variant?.format ?? product.type) === "physical";

    lines.push({
      product,
      variant,
      quantity,
      unitPriceCents,
      originalUnitPriceCents,
      lineSubtotalCents,
      lineDiscountCents,
      lineTotalCents,
      isPhysical,
      availableStock,
    });
  }

  const subtotalCents = clampCents(
    lines.reduce((total, line) => total + line.lineSubtotalCents, 0),
  );
  const productDiscountCents = clampCents(
    lines.reduce((total, line) => total + line.lineDiscountCents, 0),
  );
  const afterProductDiscountCents = clampCents(
    lines.reduce((total, line) => total + line.lineTotalCents, 0),
  );
  const couponResult = validateCoupon({
    couponCode,
    coupons,
    lines,
    subtotalCents: afterProductDiscountCents,
    isFirstPurchase,
  });

  if (couponCode && !couponResult.valid && couponResult.reason) {
    warnings.push(couponResult.reason);
  }

  const hasPhysicalItems = lines.some((line) => line.isPhysical);
  const hasDigitalItems = lines.some((line) => !line.isPhysical);
  const shippingBase =
    province && settings.provinceShippingCents[province] !== undefined
      ? settings.provinceShippingCents[province]
      : settings.defaultShippingCents;
  const shippingCents =
    hasPhysicalItems &&
    afterProductDiscountCents - couponResult.discountCents <
      settings.freeShippingFromCents
      ? shippingBase
      : 0;

  return {
    lines,
    totals: {
      subtotalCents,
      productDiscountCents,
      couponDiscountCents: couponResult.discountCents,
      shippingCents,
      totalCents: clampCents(
        afterProductDiscountCents -
          couponResult.discountCents +
          shippingCents,
      ),
    },
    coupon: couponResult.valid ? couponResult.coupon : undefined,
    warnings,
    hasPhysicalItems,
    hasDigitalItems,
  };
}
