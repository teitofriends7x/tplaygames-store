"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-4xl font-black text-white">Algo salio mal</h1>
      <p className="mt-3 text-[#A7ACB8]">
        El error fue registrado sin exponer detalles sensibles.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#1D6DFF] px-5 text-sm font-black text-white"
      >
        Reintentar
      </button>
    </section>
  );
}
