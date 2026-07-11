import type { Metadata } from "next";

import { CartPageClient } from "@/components/cart-page-client";
import { listProducts } from "@/lib/store";

export const metadata: Metadata = {
  title: "Carrito",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartPageClient products={listProducts()} />;
}
