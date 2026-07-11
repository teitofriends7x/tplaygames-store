import type { Metadata } from "next";

import { FavoritesPageClient } from "@/components/favorites-page-client";
import { listProducts } from "@/lib/store";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoritesPage() {
  const products = listProducts();

  return (
    <section className="tpg-container py-10">
      <p className="section-eyebrow">Lista local</p>
      <h1 className="mt-2 text-3xl font-black text-white">Favoritos</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A7ACB8]">
        Los favoritos se guardan en este navegador para invitados. Al activar
        Supabase, se podrán sincronizar con la cuenta del cliente.
      </p>
      <div className="mt-8">
        <FavoritesPageClient products={products} />
      </div>
    </section>
  );
}
