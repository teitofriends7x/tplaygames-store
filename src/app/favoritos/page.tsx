import Link from "next/link";

export default function FavoritesPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-black text-white">Favoritos</h1>
      <p className="mt-3 text-[#A7ACB8]">
        Los favoritos se guardan localmente para invitados. Al activar Supabase,
        se sincronizan al iniciar sesion.
      </p>
      <Link
        href="/catalogo"
        className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#1D6DFF] px-5 text-sm font-black text-white"
      >
        Explorar productos
      </Link>
    </section>
  );
}
