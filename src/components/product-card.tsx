import Image from "next/image";
import Link from "next/link";

import { AddToCartButton, FavoriteButton } from "@/components/add-to-cart-button";
import { getProductPrice } from "@/lib/catalog";
import { formatARS } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const price = getProductPrice(product);
  const hasDiscount = product.promoPriceCents !== undefined;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111318]">
      <Link href={`/catalogo/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-[#1B1D23]">
          <Image
            src={product.mainImage}
            alt={product.images[0]?.alt ?? product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          {product.offer ? (
            <span className="absolute left-3 top-3 rounded-md bg-[#EF4444] px-2 py-1 text-xs font-black text-white">
              Oferta
            </span>
          ) : null}
          {product.demo ? (
            <span className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white">
              Demo
            </span>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[#A7ACB8]">
              {product.category} {product.platform ? `/${product.platform}` : ""}
            </p>
            <h3 className="mt-1 line-clamp-2 text-base font-bold text-white">
              <Link href={`/catalogo/${product.slug}`}>{product.name}</Link>
            </h3>
          </div>
          <FavoriteButton productId={product.id} compact />
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-[#A7ACB8]">
          {product.shortDescription}
        </p>
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              {hasDiscount ? (
                <p className="text-xs text-[#A7ACB8] line-through">
                  {formatARS(product.priceCents)}
                </p>
              ) : null}
              <p className="text-xl font-black text-white">{formatARS(price)}</p>
            </div>
            <AddToCartButton
              productId={product.id}
              variantId={product.variants[0]?.id}
              compact
            />
          </div>
        </div>
      </div>
    </article>
  );
}
