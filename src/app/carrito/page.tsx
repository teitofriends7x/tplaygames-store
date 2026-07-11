import { CartPageClient } from "@/components/cart-page-client";
import { listProducts } from "@/lib/store";

export default function CartPage() {
  return <CartPageClient products={listProducts()} />;
}
