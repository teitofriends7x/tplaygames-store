import type { CartItemInput } from "@/lib/types";

export function mergeCartItems(
  localItems: CartItemInput[],
  remoteItems: CartItemInput[] = [],
): CartItemInput[] {
  const merged = new Map<string, CartItemInput>();

  for (const item of [...remoteItems, ...localItems]) {
    const key = `${item.productId}:${item.variantId ?? ""}`;
    const current = merged.get(key);
    merged.set(key, {
      productId: item.productId,
      variantId: item.variantId,
      quantity: Math.min(99, (current?.quantity ?? 0) + item.quantity),
    });
  }

  return [...merged.values()];
}

export function mergeFavoriteIds(
  localIds: string[],
  remoteIds: string[] = [],
): string[] {
  return [...new Set([...remoteIds, ...localIds].filter(Boolean))];
}
