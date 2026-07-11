"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="tpg-container py-20">
      <div className="tpg-card mx-auto max-w-3xl p-8 text-center">
        <p className="section-eyebrow">Error</p>
        <h1 className="mt-3 text-4xl font-black text-white">Algo salió mal</h1>
        <p className="mt-3 text-[#A7ACB8]">
          El error fue registrado sin exponer detalles sensibles.
        </p>
        <button onClick={reset} className="btn btn-primary mt-6">
          Reintentar
        </button>
      </div>
    </section>
  );
}
