import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleHelp,
  FileText,
  Headphones,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';

type InfoPageProps = {
  title: string;
  eyebrow: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

const policyLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
  { label: 'Delivery Policy', href: '/delivery-policy' },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getPageTheme(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('privacy')) {
    return { icon: ShieldCheck, iconBox: 'bg-violet-100 text-violet-700', accent: 'bg-violet-500' };
  }
  if (normalizedTitle.includes('delivery')) {
    return { icon: Truck, iconBox: 'bg-orange-100 text-orange-700', accent: 'bg-orange-500' };
  }
  if (normalizedTitle.includes('terms')) {
    return { icon: FileText, iconBox: 'bg-pink-100 text-pink-700', accent: 'bg-pink-500' };
  }
  if (normalizedTitle.includes('career')) {
    return { icon: BriefcaseBusiness, iconBox: 'bg-sky-100 text-sky-700', accent: 'bg-sky-500' };
  }
  if (normalizedTitle.includes('help') || normalizedTitle.includes('faq')) {
    return { icon: CircleHelp, iconBox: 'bg-emerald-100 text-emerald-700', accent: 'bg-emerald-500' };
  }

  return { icon: Sparkles, iconBox: 'bg-amber-100 text-amber-700', accent: 'bg-amber-500' };
}

export default function InfoPage({ title, eyebrow, intro, sections }: InfoPageProps) {
  const isPolicyPage = eyebrow.toLowerCase().includes('polic');
  const theme = getPageTheme(title);
  const HeroIcon = theme.icon;

  return (
    <main className="min-h-screen bg-[#f6f3f1] pb-20 pt-[92px] font-sans text-[#211820]">
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] bg-[#1d1b1a] px-6 py-9 text-white shadow-[0_24px_70px_rgba(33,24,32,0.15)] sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-pink-500/15 blur-3xl" />
          <div className="absolute -bottom-32 right-[30%] h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-white/45">
                <Link href="/" className="text-white/55 no-underline transition hover:text-white">Home</Link>
                <span>/</span>
                <span>{eyebrow}</span>
              </div>
              <p className="mt-8 text-[10px] font-black uppercase tracking-[0.22em] text-[#f18aaf]">{eyebrow}</p>
              <h1 className="mt-3 max-w-[760px] text-[36px] font-black leading-[1.08] tracking-[-0.035em] sm:text-[48px]">
                {title}
              </h1>
              <p className="mt-5 max-w-[720px] text-[14px] leading-7 text-[#bdb4af] sm:text-[15px]">{intro}</p>
            </div>

            <div className="hidden h-28 w-28 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.06] text-[#f18aaf] shadow-2xl backdrop-blur-sm lg:flex">
              <HeroIcon size={46} strokeWidth={1.45} />
            </div>
          </div>

          {isPolicyPage && (
            <div className="relative mt-9 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              {policyLinks.map((link) => {
                const active = link.label === title;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full border px-4 py-2 text-[11px] font-bold no-underline transition ${
                      active
                        ? 'border-[#f18aaf] bg-[#f18aaf] text-[#211820]'
                        : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[22px] border border-[#e4dbd6] bg-white p-5 shadow-[0_12px_35px_rgba(33,24,32,0.05)] lg:sticky lg:top-[94px]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a8d95]">On this page</p>
            <nav className="mt-4 space-y-1">
              {sections.map((section, index) => (
                <a
                  key={section.title}
                  href={`#${slugify(section.title)}`}
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 text-[12px] font-semibold text-[#62565e] no-underline transition hover:bg-[#fff4f8] hover:text-pink-700"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3eeeb] text-[10px] font-bold text-[#8a7d85] group-hover:bg-pink-100 group-hover:text-pink-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="mt-5 rounded-2xl bg-[#24211f] p-4 text-white">
              <Headphones size={19} className="text-[#f18aaf]" />
              <p className="mt-3 text-[13px] font-bold">Still have questions?</p>
              <Link href="/contact" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#f3a8c3] no-underline hover:text-white">
                Contact support <ArrowRight size={12} />
              </Link>
            </div>
          </aside>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <article
                id={slugify(section.title)}
                key={section.title}
                className="scroll-mt-[110px] overflow-hidden rounded-[22px] border border-[#e4dbd6] bg-white shadow-[0_12px_35px_rgba(33,24,32,0.045)]"
              >
                <div className="flex gap-4 p-6 sm:gap-5 sm:p-7">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.iconBox}`}>
                    <span className="text-[12px] font-black">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-black tracking-[-0.015em] text-[#211820] sm:text-[20px]">{section.title}</h2>
                    <p className="mt-3 max-w-[760px] text-[13px] leading-7 text-[#6f626a] sm:text-[14px]">{section.body}</p>
                  </div>
                </div>
                <div className={`h-1 w-full ${theme.accent}`} />
              </article>
            ))}

            <div className="mt-6 flex flex-col gap-4 rounded-[22px] border border-[#dfd5d0] bg-[#eee7e3] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[15px] font-black">Need a little more clarity?</p>
                <p className="mt-1 text-[12px] text-[#766970]">Our support team can help with policy, account and order questions.</p>
              </div>
              <Link href="/contact" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#211820] px-5 text-[12px] font-bold text-white no-underline transition hover:-translate-y-0.5 hover:bg-pink-600">
                Talk to support <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
