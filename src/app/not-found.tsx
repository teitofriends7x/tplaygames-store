import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-4xl font-black text-white">Pagina no encontrada</h1>
      <p className="mt-3 text-[#A7ACB8]">
        El contenido que buscas no existe o ya no esta publicado.
      </p>
      <Link
        href="/catalogo"
        className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#1D6DFF] px-5 text-sm font-black text-white"
      >
        Ir al catalogo
      </Link>
    </section>
  );
}
