import { BriefcaseBusiness, Code2, PackageCheck, Palette, Send } from 'lucide-react';

const teams = [
  { icon: Palette, title: 'Product & Design', body: 'Shape clear, polished shopping journeys across mobile and desktop.' },
  { icon: Code2, title: 'Engineering', body: 'Build reliable storefront, catalog, checkout and account experiences.' },
  { icon: PackageCheck, title: 'Operations', body: 'Improve product quality, delivery coordination, returns and support.' },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[#f3f7fa] pb-20 pt-[92px] text-[#17202b]">
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0d2638] to-[#183b51] px-7 py-12 text-white sm:px-11 lg:px-14 lg:py-16">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
          <BriefcaseBusiness className="text-sky-300" size={30} />
          <p className="mt-7 text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">Careers at Shopore</p>
          <h1 className="mt-4 max-w-[780px] text-[38px] font-black leading-[1.08] tracking-[-0.04em] sm:text-[52px]">Build retail experiences people enjoy using.</h1>
          <p className="mt-6 max-w-[680px] text-[14px] leading-7 text-slate-300">We value thoughtful builders who care about quality, clarity and the small details that turn shopping into a good experience.</p>
        </div>

        <div className="py-12">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Find your team</p>
          <h2 className="mt-3 text-[28px] font-black tracking-[-0.03em]">Where you can make an impact</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {teams.map((team) => {
            const Icon = team.icon;
            return <article key={team.title} className="rounded-[24px] border border-sky-100 bg-white p-7 shadow-sm"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><Icon size={20} /></span><h3 className="mt-6 text-[18px] font-black">{team.title}</h3><p className="mt-3 text-[13px] leading-7 text-slate-600">{team.body}</p></article>;
          })}
        </div>

        <div className="mt-8 grid gap-6 rounded-[26px] bg-white p-7 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center lg:p-9">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">How to apply</p><h2 className="mt-3 text-[23px] font-black">Tell us what you would love to build.</h2><p className="mt-3 max-w-[650px] text-[13px] leading-6 text-slate-600">Send your profile, portfolio or GitHub link, preferred team and a short note about your interests. We will contact you when a matching opportunity opens.</p></div>
          <a href="mailto:careers@shopore.com?subject=Career%20at%20Shopore" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0d2638] px-6 text-[12px] font-bold text-white no-underline transition hover:bg-sky-700"><Send size={15} /> careers@shopore.com</a>
        </div>
      </section>
    </main>
  );
}
