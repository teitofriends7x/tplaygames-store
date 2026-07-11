import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { TrustStrip } from "@/components/trust-strip";
import { CATEGORY_ASSETS, CATEGORIES } from "@/lib/constants";
import {
  getProductPrice,
  getTransferPrice,
  hasTransferDiscount,
} from "@/lib/catalog";
import { formatARS } from "@/lib/money";
import { listBanners, listProducts } from "@/lib/store";
import { whatsappGeneralUrl } from "@/lib/whatsapp";

export default function Home() {
  const banner = listBanners()[0];
  const products = listProducts();
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const controllers = products
    .filter((product) => product.category === "Controles")
    .slice(0, 4);
  const games = products
    .filter((product) => product.category === "Juegos")
    .slice(0, 4);
  const promoProduct = featured[0] ?? products[0];
  const promoNormalPrice = promoProduct
    ? getProductPrice(promoProduct)
    : undefined;
  const promoTransferPrice = promoProduct
    ? getTransferPrice(promoProduct)
    : undefined;
  const promoHasTransfer = promoProduct
    ? hasTransferDiscount(promoProduct)
    : false;

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(29,109,255,0.34),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
        <div className="tpg-container relative grid min-h-[640px] items-center gap-10 py-10 lg:grid-cols-[1fr_560px] lg:py-16">
          <div>
            <p className="section-eyebrow">
              {banner?.title ?? "Jugá más. Pagá menos."}
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.98] text-white md:text-7xl">
              Tu próxima partida arranca en T.PlayGames.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#B7BDCA]">
              Consolas, controles y juegos con precio especial por transferencia,
              envíos a todo el país y atención personalizada.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={banner?.href ?? "/catalogo"}
                className="btn btn-primary"
              >
                {banner?.ctaLabel ?? "Ver catálogo"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/ofertas" className="btn btn-secondary">
                Ver ofertas
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              <MiniTrust icon={ShieldCheck} title="Pago seguro" />
              <MiniTrust icon={Truck} title="Envíos a todo el país" />
              <MiniTrust icon={BadgeCheck} title="Productos sellados" />
            </div>
          </div>
          <div className="relative">
            <div className="tpg-card overflow-hidden p-3 shadow-[0_32px_90px_rgba(29,109,255,0.18)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#111318]">
                <Image
                  src="/products/consoles/ps5-slim-digital-console-dualsense.webp"
                  alt="PlayStation 5 Slim con control DualSense"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-contain p-6"
                />
              </div>
              {promoProduct ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/35 p-4">
                  <p className="text-xs font-black uppercase text-[#8FB7FF]">
                    Producto destacado
                  </p>
                  <h2 className="mt-1 font-black text-white">
                    {promoProduct.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      {promoHasTransfer ? (
                        <>
                          <p className="text-xs text-[#A7ACB8] line-through">
                            {formatARS(promoNormalPrice!)}
                          </p>
                          <p className="text-xl font-black text-[#86EFAC]">
                            {formatARS(promoTransferPrice!)}
                          </p>
                          <p className="text-[0.65rem] font-bold uppercase text-[#86EFAC]">
                            por transferencia
                          </p>
                        </>
                      ) : (
                        <p className="text-xl font-black text-white">
                          {formatARS(promoNormalPrice!)}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/catalogo/${promoProduct.slug}`}
                      className="btn btn-primary"
                    >
                      Comprar ahora
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="tpg-container py-8">
        <SectionHeader
          eyebrow="Categorías"
          title="Elegí cómo querés jugar"
          href="/catalogo"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category} category={category} />
          ))}
        </div>
      </section>

      <ProductSection
        eyebrow="Selección"
        title="Productos destacados"
        href="/catalogo?sort=featured"
        products={featured}
      />
      <ProductSection
        eyebrow="Precisión"
        title="Controles"
        href="/controles"
        products={controllers}
      />
      <ProductSection
        eyebrow="Biblioteca"
        title="Juegos"
        href="/juegos"
        products={games}
      />

      <section className="tpg-container py-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <InfoPanel
            icon={CreditCard}
            title="Métodos de pago"
            body="Mercado Pago con tarjeta, dinero en cuenta o cuotas. También aceptamos transferencia bancaria con precio especial."
          />
          <InfoPanel
            icon={Truck}
            title="Envíos a todo el país"
            body="Envío a domicilio por provincia o retiro en punto acordado. Consultá costos y plazos antes de comprar."
          />
          <InfoPanel
            icon={ShieldCheck}
            title="Garantía"
            body="Todos los productos son nuevos y sellados. Cada producto indica sus condiciones de garantía."
          />
        </div>
      </section>

      <section className="tpg-container py-10">
        <div className="tpg-card grid gap-8 p-6 lg:grid-cols-[1fr_360px] lg:p-8">
          <div>
            <p className="section-eyebrow">Dudas antes de comprar</p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Respuestas claras antes de comprar
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[
                [
                  "¿Los precios son finales?",
                  "Sí. Los precios publicados son finales. Si pagás por transferencia, accedés a un precio especial que se muestra en cada producto.",
                ],
                [
                  "¿Cómo se entregan juegos digitales?",
                  "La entrega es manual y se procesa una vez confirmado el pago. Te contactamos por el canal que elijas para completar la entrega.",
                ],
                [
                  "¿Cuándo se confirma mi pedido?",
                  "Tu pedido se confirma una vez acreditado el pago. Si pagás por transferencia, tenés 24 horas para realizarla y enviar el comprobante.",
                ],
              ].map(([question, answer]) => (
                <div key={question}>
                  <h3 className="font-black text-white">{question}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
                    {answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-5">
            <MessageCircle className="h-8 w-8 text-[#9EF0B9]" />
            <h3 className="mt-4 text-xl font-black text-white">
              ¿Querés ayuda para elegir?
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#C7F8D9]">
              Escribinos por WhatsApp y te asesoramos sin compromiso.
            </p>
            <a href={whatsappGeneralUrl()} className="btn btn-secondary mt-5">
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function MiniTrust({
  icon: Icon,
  title,
}: {
  icon: typeof ShieldCheck;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
      <Icon className="h-5 w-5 text-[#8FB7FF]" />
      <p className="mt-2 text-sm font-black text-white">{title}</p>
    </div>
  );
}

function CategoryCard({ category }: { category: (typeof CATEGORIES)[number] }) {
  const asset = CATEGORY_ASSETS[category];

  return (
    <Link
      href={asset.href}
      className="group tpg-card overflow-hidden transition hover:-translate-y-1 hover:border-[#1D6DFF]/45"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#111318]">
        <Image
          src={asset.image}
          alt={`Categoría ${category}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain p-8 transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-black text-white">{category}</h3>
        <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
          {asset.description}
        </p>
      </div>
    </Link>
  );
}

function ProductSection({
  eyebrow,
  title,
  href,
  products,
}: {
  eyebrow: string;
  title: string;
  href: string;
  products: ReturnType<typeof listProducts>;
}) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="tpg-container py-8">
      <SectionHeader eyebrow={eyebrow} title={title} href={href} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index === 0}
          />
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black text-white md:text-3xl">
          {title}
        </h2>
      </div>
      <Link href={href} className="text-sm font-black text-[#6EA2FF]">
        Ver todo
      </Link>
    </div>
  );
}

function InfoPanel({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof CreditCard;
  title: string;
  body: string;
}) {
  return (
    <article className="tpg-card p-5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1D6DFF]/13 text-[#8FB7FF]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-xl font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">{body}</p>
    </article>
  );
}
