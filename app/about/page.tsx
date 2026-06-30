import Link from 'next/link';
import { ArrowRight, Heart, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const values = [
  { icon: Sparkles, title: 'Less noise, better choices', body: 'We organise products and information so shopping feels clear instead of overwhelming.' },
  { icon: ShieldCheck, title: 'Trust in every step', body: 'Clear prices, protected checkout and useful account updates are built into the experience.' },
  { icon: Heart, title: 'Designed around people', body: 'From mobile browsing to order support, every detail starts with what customers actually need.' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f6f2ef] pb-20 pt-[92px] text-[#211820]">
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="overflow-hidden rounded-[30px] bg-[#1d1b1a] text-white shadow-[0_24px_70px_rgba(33,24,32,0.16)]">
          <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
            <div className="px-7 py-12 sm:px-11 lg:px-14 lg:py-16">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f18aaf]">About Shopore</p>
              <h1 className="mt-4 max-w-[700px] text-[38px] font-black leading-[1.06] tracking-[-0.04em] sm:text-[54px]">Shopping should feel exciting, not exhausting.</h1>
              <p className="mt-6 max-w-[650px] text-[14px] leading-7 text-[#bbb1ac]">Shopore brings fashion, beauty, home and lifestyle favourites into one thoughtful store—built for easy discovery and confident decisions.</p>
              <Link href="/explore" className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-[#f18aaf] px-5 text-[12px] font-bold text-[#211820] no-underline transition hover:-translate-y-0.5 hover:bg-white">
                Explore Shopore <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/10 p-px">
              {[
                ['6+', 'Shopping categories'],
                ['7 days', 'Return support'],
                ['Secure', 'Protected checkout'],
                ['Simple', 'Order tracking'],
              ].map(([value, label]) => (
                <div key={label} className="flex min-h-[150px] flex-col justify-end bg-[#24211f] p-6">
                  <strong className="text-[24px] font-black text-white">{value}</strong>
                  <span className="mt-1 text-[11px] text-white/45">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-14 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600">What guides us</p>
          <h2 className="mx-auto mt-3 max-w-[600px] text-[30px] font-black tracking-[-0.03em]">A calmer, more useful way to shop online.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article key={value.title} className="rounded-[24px] border border-[#e2d8d3] bg-white p-7 shadow-[0_12px_35px_rgba(33,24,32,0.05)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-700"><Icon size={20} /></span>
                <h3 className="mt-6 text-[18px] font-black">{value.title}</h3>
                <p className="mt-3 text-[13px] leading-7 text-[#71646b]">{value.body}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-5 rounded-[24px] border border-orange-100 bg-orange-50 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4"><Truck className="mt-1 text-orange-600" size={23} /><div><h3 className="text-[17px] font-black">From bag to doorstep</h3><p className="mt-2 text-[13px] text-[#74666d]">We keep delivery estimates, order progress and support close at hand.</p></div></div>
          <Link href="/delivery-policy" className="inline-flex items-center gap-2 text-[12px] font-bold text-orange-700 no-underline">How delivery works <ArrowRight size={14} /></Link>
        </div>
      </section>
    </main>
  );
}
