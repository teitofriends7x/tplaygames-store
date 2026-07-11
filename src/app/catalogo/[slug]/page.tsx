import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductCard } from "@/components/product-card";
import { filterCatalog, findProductBySlug, getProductPrice } from "@/lib/catalog";
import { formatARS } from "@/lib/money";
import { listProducts } from "@/lib/store";
import { whatsappProductUrl } from "@/lib/whatsapp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug, listProducts());

  if (!product) {
    return {};
  }

  return {
    title: product.seoTitle,
    description: product.seoDescription,
    alternates: {
      canonical: `/catalogo/${product.slug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = listProducts();
  const product = findProductBySlug(slug, products);

  if (!product || product.publicationStatus !== "published") {
    notFound();
  }

  const related = filterCatalog(
    { category: product.category, pageSize: 4 },
    products,
  ).products.filter((item) => item.id !== product.id);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription,
    sku: product.sku,
    brand: product.brand,
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: getProductPrice(product) / 100,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <article className="mx-auto w-full max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-[#111318]">
            <Image
              src={product.mainImage}
              alt={product.images[0]?.alt ?? product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-cover"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-[#111318]"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-black uppercase text-[#1D6DFF]">
            {product.category} {product.platform ? `/ ${product.platform}` : ""}
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">{product.name}</h1>
          <p className="mt-3 text-[#A7ACB8]">{product.shortDescription}</p>
          <div className="mt-5">
            {product.promoPriceCents ? (
              <p className="text-sm text-[#A7ACB8] line-through">
                {formatARS(product.priceCents)}
              </p>
            ) : null}
            <p className="text-4xl font-black text-white">
              {formatARS(getProductPrice(product))}
            </p>
          </div>
          <div className="mt-6">
            <ProductPurchasePanel product={product} />
          </div>
          <a
            href={whatsappProductUrl(product)}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#22C55E]/40 bg-[#22C55E]/10 px-4 text-sm font-black text-[#BFF7D2]"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-white/10 bg-[#111318] p-5">
          <h2 className="text-2xl font-black text-white">Descripcion</h2>
          <p className="mt-3 leading-7 text-[#A7ACB8]">{product.description}</p>
          <h3 className="mt-6 font-black text-white">Caracteristicas</h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-[#A7ACB8]">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <aside className="rounded-lg border border-white/10 bg-[#111318] p-5">
          <h2 className="text-xl font-black text-white">Entrega y garantia</h2>
          <p className="mt-3 text-sm leading-6 text-[#A7ACB8]">
            {product.deliveryTerms}
          </p>
          <p className="mt-3 text-sm leading-6 text-[#A7ACB8]">
            {product.warranty}
          </p>
          <p className="mt-3 text-sm leading-6 text-[#A7ACB8]">
            Metodos de pago: Mercado Pago Checkout Pro al activar credenciales.
          </p>
        </aside>
      </section>
      {related.length ? (
        <section className="mt-10">
          <h2 className="text-2xl font-black text-white">Relacionados</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
