"use client";

import { useSyncExternalStore } from "react";

import type { CartItemInput } from "@/lib/types";

const CART_KEY = "tplaygames.cart.v1";
const FAVORITES_KEY = "tplaygames.favorites.v1";
const EMPTY_CART: CartItemInput[] = [];
const EMPTY_FAVORITES: string[] = [];
let lastCartRaw = "";
let lastCartSnapshot: CartItemInput[] = EMPTY_CART;
let lastFavoritesRaw = "";
let lastFavoritesSnapshot: string[] = EMPTY_FAVORITES;

export function readCart(): CartItemInput[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getCartSnapshot(): CartItemInput[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  const raw = window.localStorage.getItem(CART_KEY) || "[]";
  if (raw === lastCartRaw) {
    return lastCartSnapshot;
  }

  lastCartRaw = raw;
  try {
    const parsed = JSON.parse(raw);
    lastCartSnapshot = Array.isArray(parsed) ? parsed : EMPTY_CART;
  } catch {
    lastCartSnapshot = EMPTY_CART;
  }

  return lastCartSnapshot;
}

export function writeCart(items: CartItemInput[]): void {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("tplaygames-cart"));
}

export function addCartItem(item: CartItemInput): void {
  const items = readCart();
  const index = items.findIndex(
    (entry) =>
      entry.productId === item.productId && entry.variantId === item.variantId,
  );

  if (index >= 0) {
    items[index] = {
      ...items[index],
      quantity: Math.min(99, items[index].quantity + item.quantity),
    };
  } else {
    items.push(item);
  }

  writeCart(items);
}

export function clearCart(): void {
  writeCart([]);
}

export function readFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(FAVORITES_KEY) || "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getFavoritesSnapshot(): string[] {
  if (typeof window === "undefined") {
    return EMPTY_FAVORITES;
  }

  const raw = window.localStorage.getItem(FAVORITES_KEY) || "[]";
  if (raw === lastFavoritesRaw) {
    return lastFavoritesSnapshot;
  }

  lastFavoritesRaw = raw;
  try {
    const parsed = JSON.parse(raw);
    lastFavoritesSnapshot = Array.isArray(parsed) ? parsed : EMPTY_FAVORITES;
  } catch {
    lastFavoritesSnapshot = EMPTY_FAVORITES;
  }

  return lastFavoritesSnapshot;
}

export function toggleFavorite(productId: string): string[] {
  const favorites = new Set(readFavorites());
  if (favorites.has(productId)) {
    favorites.delete(productId);
  } else {
    favorites.add(productId);
  }

  const next = [...favorites];
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("tplaygames-favorites"));

  return next;
}

export function writeFavorites(productIds: string[]): void {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(productIds));
  window.dispatchEvent(new Event("tplaygames-favorites"));
}

export function useCartItems(): CartItemInput[] {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("tplaygames-cart", callback);
      window.addEventListener("storage", callback);

      return () => {
        window.removeEventListener("tplaygames-cart", callback);
        window.removeEventListener("storage", callback);
      };
    },
    getCartSnapshot,
    () => EMPTY_CART,
  );
}

export function useFavoriteProductIds(): string[] {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("tplaygames-favorites", callback);
      window.addEventListener("storage", callback);

      return () => {
        window.removeEventListener("tplaygames-favorites", callback);
        window.removeEventListener("storage", callback);
      };
    },
    getFavoritesSnapshot,
    () => EMPTY_FAVORITES,
  );
}
