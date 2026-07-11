import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout-form";
import { listProducts } from "@/lib/store";

export const metadata: Metadata = {
  title: "Checkout",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutForm products={listProducts()} />;
}
