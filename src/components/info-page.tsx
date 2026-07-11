export function InfoPage({
  title,
  sections,
  legal = false,
}: {
  title: string;
  sections: [string, string][];
  legal?: boolean;
}) {
  return (
    <section className="tpg-container py-10">
      <p className="section-eyebrow">Ayuda</p>
      <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
      {legal ? (
        <p className="mt-4 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-sm leading-6 text-[#F8D18A]">
          Plantilla inicial pendiente de revisión profesional. No constituye
          asesoramiento legal ni condiciones comerciales definitivas.
        </p>
      ) : null}
      <div className="mt-6 space-y-4">
        {sections.map(([heading, body]) => (
          <section key={heading} className="tpg-card p-5">
            <h2 className="text-xl font-black text-white">{heading}</h2>
            <p className="mt-2 leading-7 text-[#A7ACB8]">{body}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
