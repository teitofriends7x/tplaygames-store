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
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-black text-white">{title}</h1>
      {legal ? (
        <p className="mt-4 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-sm text-[#F8D18A]">
          Plantilla inicial pendiente de revision profesional. No constituye
          asesoramiento legal ni condiciones comerciales definitivas.
        </p>
      ) : null}
      <div className="mt-6 space-y-4">
        {sections.map(([heading, body]) => (
          <section
            key={heading}
            className="rounded-lg border border-white/10 bg-[#111318] p-5"
          >
            <h2 className="text-xl font-black text-white">{heading}</h2>
            <p className="mt-2 leading-7 text-[#A7ACB8]">{body}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
