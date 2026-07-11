import { ArrowRight, BadgeCheck, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { listBanners, listProducts } from "@/lib/store";

export default function Home() {
  const banner = listBanners()[0];
  const products = listProducts();
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const offers = products.filter((product) => product.offer).slice(0, 4);

  return (
    <>
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_70%_15%,rgba(29,109,255,0.26),transparent_28%),#070707]">
        <div className="mx-auto grid min-h-[560px] w-full max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="text-sm font-black uppercase text-[#1D6DFF]">
              {banner?.title ?? "Jugá más. Pagá menos."}
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight text-white md:text-7xl">
              T.PlayGames
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#A7ACB8]">
              {banner?.body ??
                "Consolas, controles y juegos con stock validado y checkout seguro."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={banner?.href ?? "/catalogo"}
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#1D6DFF] px-5 text-sm font-black text-white hover:bg-[#1558D6]"
              >
                {banner?.ctaLabel ?? "Ver catalogo"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/ofertas"
                className="inline-flex h-12 items-center rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-black text-white hover:bg-white/10"
              >
                Ofertas
              </Link>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border border-white/10 bg-[#111318]/90 p-4">
            <div className="rounded-lg bg-[#1B1D23] p-5">
              <p className="text-sm text-[#A7ACB8]">Categoria destacada</p>
              <h2 className="mt-2 text-2xl font-black text-white">Juegos digitales</h2>
              <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
                Entrega manual segura desde administracion despues de confirmar
                el pago. Sin licencias inventadas.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Benefit icon={<ShieldCheck />} label="Pago seguro" />
              <Benefit icon={<Truck />} label="Envios AR" />
              <Benefit icon={<BadgeCheck />} label="Stock real" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <SectionHeader title="Categorias" href="/catalogo" />
        <div className="grid gap-3 md:grid-cols-3">
          {["Consolas", "Controles", "Juegos"].map((category) => (
            <Link
              key={category}
              href={`/${category.toLocaleLowerCase("es-AR")}`}
              className="rounded-lg border border-white/10 bg-[#111318] p-5 text-xl font-black text-white hover:border-[#1D6DFF]"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <SectionHeader title="Destacados" href="/catalogo?sort=featured" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
          ))}
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <SectionHeader title="Ofertas" href="/ofertas" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
          ))}
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="rounded-lg border border-white/10 bg-[#111318] p-6">
          <h2 className="text-2xl font-black text-white">Preguntas frecuentes</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ["¿Los productos demo son reales?", "No. Estan marcados para desarrollo y deben reemplazarse antes de vender."],
              ["¿Como se entregan juegos digitales?", "Inicialmente con procesamiento manual protegido desde el panel."],
              ["¿Mercado Pago esta activo?", "Queda preparado. Requiere credenciales para prueba o produccion."],
            ].map(([question, answer]) => (
              <div key={question}>
                <h3 className="font-bold text-white">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Benefit({
  icon,
  label,
}: {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#070707] p-3 text-center text-xs font-bold text-white">
      <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-md bg-[#1D6DFF]/15 text-[#1D6DFF]">
        {icon}
      </div>
      {label}
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <Link href={href} className="text-sm font-bold text-[#1D6DFF]">
        Ver todo
      </Link>
    </div>
  );
}
