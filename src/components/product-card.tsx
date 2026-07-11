import Image from "next/image";
import Link from "next/link";
import { Truck } from "lucide-react";

import {
  AddToCartButton,
  FavoriteButton,
} from "@/components/add-to-cart-button";
import {
  getProductPrice,
  getTransferPrice,
  hasTransferDiscount,
} from "@/lib/catalog";
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
  const normalPrice = getProductPrice(product);
  const transferPrice = getTransferPrice(product);
  const showTransfer = hasTransferDiscount(product);
  const secondaryImage = product.images.find((img) => !img.isPrimary);
  const isPreorder = product.availabilityStatus === "preorder";
  const isPurchasable = product.stock > 0 && !isPreorder;

  const topBadges: { label: string; className: string }[] = [];
  if (product.offer) {
    const discountPercent = product.promoPriceCents
      ? Math.round(
          100 - (product.promoPriceCents / product.priceCents) * 100,
        )
      : 0;
    topBadges.push({
      label: discountPercent > 0 ? `${discountPercent}% OFF` : "Oferta",
      className: "tpg-badge-offer",
    });
  }
  if (isPreorder) {
    topBadges.push({ label: "Preventa", className: "tpg-badge-preorder" });
  }

  const metaBadges: { key: string; label: string; className: string }[] = [
    {
      key: "type",
      label: PRODUCT_TYPE_LABELS[product.type],
      className: "tpg-badge-type",
    },
  ];
  if (product.type === "digital") {
    metaBadges.push({
      key: "digital-delivery",
      label: "Entrega manual",
      className: "tpg-badge-digital",
    });
  }

  return (
    <article className="tpg-product-card group">
      <Link href={`/catalogo/${product.slug}`} className="tpg-product-media">
        <div className="tpg-product-image-wrap">
          <Image
            src={product.mainImage}
            alt={product.images[0]?.alt ?? product.name}
            fill
            unoptimized
            priority={priority}
            loading={priority ? undefined : "eager"}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            placeholder={product.images[0]?.blurDataUrl ? "blur" : "empty"}
            blurDataURL={product.images[0]?.blurDataUrl}
            className="tpg-product-image-primary"
          />
          {secondaryImage ? (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              placeholder={secondaryImage.blurDataUrl ? "blur" : "empty"}
              blurDataURL={secondaryImage.blurDataUrl}
              className="tpg-product-image-secondary"
            />
          ) : null}
        </div>
        {topBadges.length > 0 ? (
          <div className="tpg-product-badges-top">
            {topBadges.map((b) => (
              <span key={b.label} className={`badge ${b.className}`}>
                {b.label}
              </span>
            ))}
          </div>
        ) : null}
        <div className="tpg-product-badges-meta">
          {metaBadges.map((b) => (
            <span key={b.key} className={`badge ${b.className}`}>
              {b.label}
            </span>
          ))}
        </div>
      </Link>

      <div className="tpg-product-body">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="tpg-product-category">
              {product.platform ?? product.category} ·{" "}
              {PRODUCT_CONDITION_LABELS[product.condition]}
            </p>
            <h3 className="tpg-product-name">
              <Link href={`/catalogo/${product.slug}`}>{product.name}</Link>
            </h3>
          </div>
          <FavoriteButton productId={product.id} compact />
        </div>

        <p className="tpg-product-desc">{product.shortDescription}</p>

        <div className="tpg-product-stock-row">
          {isPreorder ? (
            <span className="badge tpg-badge-preorder">Preventa</span>
          ) : product.stock > 3 ? (
            <span className="badge tpg-badge-stock">En stock</span>
          ) : product.stock > 0 ? (
            <span className="badge tpg-badge-stock">Últimas unidades</span>
          ) : (
            <span className="badge tpg-badge-out">Sin stock</span>
          )}
          <span className="badge tpg-badge-shipping">
            <Truck className="h-3 w-3" />
            Envío
          </span>
        </div>

        <div className="tpg-product-footer">
          <div className="tpg-product-pricing">
            {showTransfer ? (
              <>
                <p className="tpg-product-price-old">
                  {formatARS(normalPrice)}
                </p>
                <p className="tpg-product-price">
                  {formatARS(transferPrice)}
                </p>
                <p className="tpg-product-transfer-label">
                  por transferencia
                </p>
              </>
            ) : (
              <p className="tpg-product-price">{formatARS(normalPrice)}</p>
            )}
          </div>
          <AddToCartButton
            productId={product.id}
            variantId={product.variants[0]?.id}
            compact
            disabled={!isPurchasable}
            disabledLabel={isPreorder ? "Preventa" : "Sin stock"}
          />
        </div>
      </div>
    </article>
  );
}
