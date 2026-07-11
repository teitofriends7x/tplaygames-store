import { calculatePercentageDiscount, clampCents } from "@/lib/money";
import type { CartLine, Coupon } from "@/lib/types";

export type CouponValidationContext = {
  couponCode?: string;
  coupons: Coupon[];
  lines: CartLine[];
  subtotalCents: number;
  customerId?: string;
  isFirstPurchase?: boolean;
  now?: Date;
};

export type CouponValidationResult =
  | {
      valid: true;
      coupon: Coupon;
      discountCents: number;
    }
  | {
      valid: false;
      reason?: string;
      discountCents: 0;
    };

export function validateCoupon(
  context: CouponValidationContext,
): CouponValidationResult {
  const code = context.couponCode?.trim().toUpperCase();

  if (!code) {
    return { valid: false, discountCents: 0 };
  }

  const coupon = context.coupons.find((item) => item.code === code);

  if (!coupon || !coupon.active) {
    return {
      valid: false,
      reason: "El cupón no existe o no está activo.",
      discountCents: 0,
    };
  }

  const now = context.now ?? new Date();
  if (new Date(coupon.startsAt).getTime() > now.getTime()) {
    return {
      valid: false,
      reason: "El cupón todavía no está disponible.",
      discountCents: 0,
    };
  }

  if (coupon.endsAt && new Date(coupon.endsAt).getTime() < now.getTime()) {
    return {
      valid: false,
      reason: "El cupón está vencido.",
      discountCents: 0,
    };
  }

  if (coupon.totalLimit && coupon.redemptions >= coupon.totalLimit) {
    return {
      valid: false,
      reason: "El cupón alcanzó su límite de usos.",
      discountCents: 0,
    };
  }

  if (coupon.firstPurchaseOnly && context.isFirstPurchase === false) {
    return {
      valid: false,
      reason: "El cupón aplica solo a la primera compra.",
      discountCents: 0,
    };
  }

  if (context.subtotalCents < coupon.minPurchaseCents) {
    return {
      valid: false,
      reason: "El carrito no alcanza la compra mínima del cupón.",
      discountCents: 0,
    };
  }

  const eligibleLines = context.lines.filter((line) => {
    if (
      coupon.applicableCategories?.length &&
      !coupon.applicableCategories.includes(line.product.category)
    ) {
      return false;
    }

    if (
      coupon.applicableProducts?.length &&
      !coupon.applicableProducts.includes(line.product.id)
    ) {
      return false;
    }

    return true;
  });

  const eligibleSubtotal = eligibleLines.reduce(
    (total, line) => total + line.lineTotalCents,
    0,
  );

  if (eligibleSubtotal <= 0) {
    return {
      valid: false,
      reason: "El cupón no aplica a los productos del carrito.",
      discountCents: 0,
    };
  }

  const discount =
    coupon.type === "percentage"
      ? calculatePercentageDiscount(eligibleSubtotal, coupon.value)
      : clampCents(coupon.value);

  return {
    valid: true,
    coupon,
    discountCents: Math.min(discount, eligibleSubtotal),
  };
}
