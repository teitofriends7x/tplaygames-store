import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  CreditCard,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductCard } from "@/components/product-card";
import { RecentlyViewedProducts } from "@/components/recently-viewed";
import {
  filterCatalog,
  findProductBySlug,
  getProductPrice,
} from "@/lib/catalog";
import {
  PRODUCT_CONDITION_LABELS,
  PRODUCT_TYPE_LABELS,
  STORE_NAME,
} from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import { getStoreState, listProducts } from "@/lib/store";
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
  const settings = getStoreState().settings;

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
    image: product.images.map((image) => image.url),
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: getProductPrice(product) / 100,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };
  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category,
        item:
          product.category === "Consolas"
            ? "/consolas"
            : product.category === "Controles"
              ? "/controles"
              : "/juegos",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `/catalogo/${product.slug}`,
      },
    ],
  };
  const discountPercent = product.promoPriceCents
    ? Math.round(100 - (product.promoPriceCents / product.priceCents) * 100)
    : 0;
  const transferPrice =
    settings.paymentMethods.transfer && settings.transferDiscountPercent
      ? Math.round(
          getProductPrice(product) *
            (1 - settings.transferDiscountPercent / 100),
        )
      : undefined;
  const activeInstallments = settings.installments?.filter(
    (item) => item.active,
  );

  return (
    <article className="tpg-container py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#A7ACB8]"
      >
        <Link href="/" className="hover:text-white">
          Inicio
        </Link>
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
        <Link
          href={
            product.category === "Consolas"
              ? "/consolas"
              : product.category === "Controles"
                ? "/controles"
                : "/juegos"
          }
          className="hover:text-white"
        >
          {product.category}
        </Link>
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
        <span className="text-white">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">
        <div>
          <ProductGallery images={product.images} name={product.name} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-blue">{product.category}</span>
            {product.platform ? (
              <span className="badge badge-muted">{product.platform}</span>
            ) : null}
            <span className="badge badge-muted">
              {PRODUCT_TYPE_LABELS[product.type]}
            </span>
            <span className="badge badge-muted">
              {PRODUCT_CONDITION_LABELS[product.condition]}
            </span>
            {product.demo ? (
              <span className="badge badge-green">Demo</span>
            ) : null}
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-[#A7ACB8]">
            {product.shortDescription}
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            {product.promoPriceCents ? (
              <div className="mb-2 flex items-center gap-3">
                <p className="text-sm text-[#A7ACB8] line-through">
                  {formatARS(product.priceCents)}
                </p>
                <span className="badge badge-green">
                  {discountPercent}% OFF
                </span>
              </div>
            ) : null}
            <p className="text-4xl font-black text-white">
              {formatARS(getProductPrice(product))}
            </p>
            {transferPrice ? (
              <p className="mt-2 text-sm font-semibold text-[#86EFAC]">
                {formatARS(transferPrice)} por transferencia configurada
              </p>
            ) : null}
            {activeInstallments?.length ? (
              <p className="mt-2 text-sm text-[#A7ACB8]">
                {activeInstallments.map((item) => item.label).join(" · ")}
              </p>
            ) : null}
          </div>
          <div className="mt-6">
            <ProductPurchasePanel product={product} />
          </div>
          <a
            href={whatsappProductUrl(product)}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 px-4 text-sm font-black text-[#BFF7D2] transition hover:bg-[#22C55E]/16"
          >
            <MessageCircle className="h-4 w-4" />
            Consultar por WhatsApp
          </a>
          <div className="mt-5 grid gap-3">
            <InfoPill
              icon={Truck}
              title={
                product.type === "digital"
                  ? "Entrega digital manual"
                  : "Envío con costo validado"
              }
              body={product.deliveryTerms}
            />
            <InfoPill
              icon={ShieldCheck}
              title="Garantía"
              body={product.warranty}
            />
            <InfoPill
              icon={CreditCard}
              title="Medios de pago"
              body={paymentText(settings.paymentMethods)}
            />
          </div>
        </div>
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="tpg-card p-6">
          <p className="section-eyebrow">Detalle del producto</p>
          <h2 className="mt-2 text-2xl font-black text-white">Descripción</h2>
          <p className="mt-4 leading-7 text-[#A7ACB8]">{product.description}</p>
          <h3 className="mt-8 text-lg font-black text-white">
            Características
          </h3>
          <ul className="mt-4 grid gap-3 text-sm text-[#A7ACB8] sm:grid-cols-2">
            {product.features.map((feature) => (
              <li key={feature} className="flex gap-3">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1D6DFF]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-8 text-lg font-black text-white">
            Preguntas frecuentes
          </h3>
          <div className="mt-4 grid gap-3">
            <Faq
              question="¿El stock se reserva al agregar al carrito?"
              answer="No. El stock y el precio se vuelven a validar en servidor al crear el pedido."
            />
            <Faq
              question="¿Cuándo recibo un producto digital?"
              answer="Después de confirmar el pago, el operador procesa la entrega digital manual por el canal configurado."
            />
            <Faq
              question="¿Puedo consultar antes de comprar?"
              answer={`Sí. Desde esta ficha podés abrir WhatsApp con el producto ${STORE_NAME} ya referenciado.`}
            />
          </div>
        </div>
        <aside className="tpg-card h-fit p-6">
          <p className="section-eyebrow">Ficha técnica</p>
          <dl className="mt-4 grid gap-4 text-sm">
            <Spec label="SKU" value={product.sku} />
            <Spec label="Marca" value={product.brand} />
            <Spec label="Modelo" value={product.model} />
            <Spec label="Categoría" value={product.category} />
            <Spec label="Plataforma" value={product.platform ?? "No aplica"} />
            <Spec label="Tipo" value={PRODUCT_TYPE_LABELS[product.type]} />
            <Spec
              label="Estado"
              value={PRODUCT_CONDITION_LABELS[product.condition]}
            />
            <Spec
              label="Última actualización"
              value={formatDateTimeAR(product.updatedAt)}
            />
          </dl>
          <div className="mt-6 rounded-xl border border-[#1D6DFF]/25 bg-[#1D6DFF]/10 p-4 text-sm leading-6 text-[#C8D9FF]">
            Este producto demo está pensado para validar navegación, compra y
            administración. Reemplazá imágenes y textos desde el panel antes de
            publicar datos comerciales definitivos.
          </div>
        </aside>
      </section>
      {related.length ? (
        <section className="mt-12">
          <p className="section-eyebrow">También puede interesarte</p>
          <h2 className="mt-2 text-2xl font-black text-white">Relacionados</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
      <RecentlyViewedProducts
        key={product.id}
        currentProductId={product.id}
        products={products}
      />
    </article>
  );
}

function paymentText(settings: { mercadoPago: boolean; transfer: boolean }) {
  const methods = [
    settings.mercadoPago ? "Mercado Pago" : undefined,
    settings.transfer ? "transferencia" : undefined,
  ].filter(Boolean);

  return methods.length
    ? `${methods.join(" y ")}. Las credenciales reales se activan por entorno.`
    : "Los métodos de pago se configuran desde administración.";
}

function InfoPill({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof PackageCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#1D6DFF]/13 text-[#8FB7FF]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-sm font-black text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[#A7ACB8]">{body}</p>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <dt className="text-[#A7ACB8]">{label}</dt>
      <dd className="text-right font-semibold text-white">{value}</dd>
    </div>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <summary className="cursor-pointer text-sm font-black text-white">
        {question}
      </summary>
      <p className="mt-3 text-sm leading-6 text-[#A7ACB8]">{answer}</p>
    </details>
  );
}
