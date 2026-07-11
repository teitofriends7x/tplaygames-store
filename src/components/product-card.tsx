import Image from "next/image";
import Link from "next/link";
import { Truck } from "lucide-react";

import {
  AddToCartButton,
  FavoriteButton,
} from "@/components/add-to-cart-button";
import { getProductPrice } from "@/lib/catalog";
import { PRODUCT_CONDITION_LABELS, PRODUCT_TYPE_LABELS } from "@/lib/constants";
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
  const discountPercent =
    hasDiscount && product.promoPriceCents
      ? Math.round(100 - (product.promoPriceCents / product.priceCents) * 100)
      : 0;
  const secondaryImage = product.images.find((image) => !image.isPrimary);

  return (
    <article className="group tpg-card flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-[#1D6DFF]/45 hover:shadow-[0_24px_60px_rgba(29,109,255,0.12)]">
      <Link href={`/catalogo/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#1B1D23]">
          <Image
            src={product.mainImage}
            alt={product.images[0]?.alt ?? product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, 25vw"
            placeholder={product.images[0]?.blurDataUrl ? "blur" : "empty"}
            blurDataURL={product.images[0]?.blurDataUrl}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          {secondaryImage ? (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              placeholder={secondaryImage.blurDataUrl ? "blur" : "empty"}
              blurDataURL={secondaryImage.blurDataUrl}
              className="object-cover opacity-0 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
            />
          ) : null}
          <div className="absolute left-3 right-3 top-3 flex flex-wrap gap-2">
            {product.offer ? (
              <span className="badge badge-red">
                {discountPercent > 0 ? `${discountPercent}% OFF` : "Oferta"}
              </span>
            ) : null}
            <span className="badge badge-muted">
              {PRODUCT_TYPE_LABELS[product.type]}
            </span>
          </div>
          {product.demo ? (
            <span className="badge badge-blue absolute bottom-3 right-3">
              Demo
            </span>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-[#8E96A6]">
              {product.platform ?? product.category} ·{" "}
              {PRODUCT_CONDITION_LABELS[product.condition]}
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
        <div className="mt-3 flex flex-wrap gap-2">
          {product.stock > 0 ? (
            <span className="badge badge-green">Stock {product.stock}</span>
          ) : (
            <span className="badge badge-red">Sin stock</span>
          )}
          <span className="badge badge-muted">
            <Truck className="h-3.5 w-3.5" />
            Envío calculado
          </span>
        </div>
        <div className="mt-auto pt-4">
          <p className="mb-3 text-xs leading-5 text-[#8E96A6]">
            Garantía y entrega configurables desde administración.
          </p>
          <div className="flex items-end justify-between gap-3">
            <div>
              {hasDiscount ? (
                <p className="text-xs text-[#A7ACB8] line-through">
                  {formatARS(product.priceCents)}
                </p>
              ) : null}
              <p className="text-xl font-black text-white">
                {formatARS(price)}
              </p>
            </div>
            <AddToCartButton
              productId={product.id}
              variantId={product.variants[0]?.id}
              compact
              disabled={product.stock <= 0}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
