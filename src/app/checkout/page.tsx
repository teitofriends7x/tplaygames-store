import { CheckoutForm } from "@/components/checkout-form";
import { listProducts } from "@/lib/store";

export default function CheckoutPage() {
  return <CheckoutForm products={listProducts()} />;
}
