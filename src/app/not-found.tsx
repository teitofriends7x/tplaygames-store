import Link from "next/link";

export default function NotFound() {
  return (
    <section className="tpg-container py-20">
      <div className="tpg-card mx-auto max-w-3xl p-8 text-center">
        <p className="section-eyebrow">404</p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Página no encontrada
        </h1>
        <p className="mt-3 text-[#A7ACB8]">
          El contenido que buscás no existe o ya no está publicado.
        </p>
        <Link href="/catalogo" className="btn btn-primary mt-6">
          Ir al catálogo
        </Link>
      </div>
    </section>
  );
}
