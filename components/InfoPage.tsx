type InfoPageProps = {
  title: string;
  eyebrow: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export default function InfoPage({ title, eyebrow, intro, sections }: InfoPageProps) {
  return (
    <main className="min-h-screen bg-white px-4 pb-16 pt-[112px] font-['DM_Sans',Inter,sans-serif] text-[#071225] md:px-10">
      <section className="mx-auto max-w-[1120px]">
        <div className="border-b border-pink-100 pb-10">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-pink-500">
            {eyebrow}
          </p>
          <h1 className="max-w-[760px] text-[34px] font-bold leading-tight tracking-[0] md:text-[48px]">
            {title}
          </h1>
          <p className="mt-5 max-w-[680px] text-[16px] leading-7 text-slate-600">
            {intro}
          </p>
        </div>

        <div className="grid gap-5 py-10 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-[19px] font-bold text-[#071225]">{section.title}</h2>
              <p className="mt-3 text-[14px] leading-6 text-slate-600">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
