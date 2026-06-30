import { BellRing, CreditCard, Database, Eye, LockKeyhole, UserCheck } from 'lucide-react';

const principles = [
  { icon: Eye, title: 'Clear use', body: 'We use information only to operate, protect and improve your shopping experience.' },
  { icon: LockKeyhole, title: 'Protected access', body: 'Access to account and order information is limited to appropriate systems and workflows.' },
  { icon: UserCheck, title: 'Your choices', body: 'You can contact us about account details, communication preferences or privacy questions.' },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f4fb] pb-20 pt-[92px] text-[#211a2a]">
      <section className="mx-auto max-w-[1220px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[30px] bg-[#241d2d] px-7 py-12 text-white sm:px-11 lg:px-14 lg:py-16">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-300 ring-1 ring-white/10"><LockKeyhole size={23} /></span>
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">Privacy at Shopore</p>
          <h1 className="mt-4 max-w-[740px] text-[40px] font-black leading-[1.08] tracking-[-0.04em] sm:text-[52px]">Your information supports your order—not somebody else’s curiosity.</h1>
          <p className="mt-6 max-w-[690px] text-[14px] leading-7 text-violet-100/65">This policy explains what information we use, why it is needed and the choices available to you.</p>
        </div>

        <div className="grid gap-5 py-9 md:grid-cols-3">
          {principles.map((item) => { const Icon = item.icon; return <article key={item.title} className="rounded-[22px] border border-violet-100 bg-white p-6 shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><Icon size={18} /></span><h2 className="mt-5 text-[16px] font-black">{item.title}</h2><p className="mt-3 text-[12px] leading-6 text-slate-600">{item.body}</p></article>; })}
        </div>

        <div className="overflow-hidden rounded-[26px] border border-violet-100 bg-white shadow-sm">
          <PrivacyRow icon={Database} number="01" title="Information we use" body="Account name, email, phone, saved addresses, order details and limited device information may be used to process purchases, support customers and improve service reliability." />
          <PrivacyRow icon={CreditCard} number="02" title="Payments" body="Payments are processed through secure payment partners. Shopore does not store sensitive card numbers, PINs or payment authentication credentials." />
          <PrivacyRow icon={BellRing} number="03" title="Communication" body="We may send essential order, delivery, refund, support and account messages. Promotional communication is sent only through applicable subscription choices." />
          <PrivacyRow icon={UserCheck} number="04" title="Access and questions" body="For account or privacy assistance, email shyamashreedas5@gmail.com from your registered email address so we can safely review the request." last />
        </div>
      </section>
    </main>
  );
}

function PrivacyRow({ icon: Icon, number, title, body, last = false }: { icon: typeof Eye; number: string; title: string; body: string; last?: boolean }) {
  return <article className={`grid gap-4 p-6 sm:grid-cols-[48px_1fr] sm:p-7 ${last ? '' : 'border-b border-violet-100'}`}><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><Icon size={19} /></span><div><span className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">Section {number}</span><h2 className="mt-1 text-[18px] font-black">{title}</h2><p className="mt-3 max-w-[820px] text-[13px] leading-7 text-slate-600">{body}</p></div></article>;
}
