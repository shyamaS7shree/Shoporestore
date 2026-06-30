import Link from 'next/link';
import { ArrowRight, FileCheck2, Scale } from 'lucide-react';

const clauses = [
  { title: 'Using Shopore', body: 'Use Shopore only for lawful browsing and shopping. Do not attempt to disrupt the service, access another customer’s information, copy protected material or misuse website functionality.' },
  { title: 'Product information', body: 'We work to keep product descriptions, images, prices, sizes and availability accurate. Minor display differences may occur, and catalog information can change without prior notice.' },
  { title: 'Orders and confirmation', body: 'An order is confirmed after successful checkout and verification. We may cancel or adjust an order if payment fails, stock is unavailable, details cannot be verified or an obvious pricing error occurs.' },
  { title: 'Payments and refunds', body: 'Payments are handled by supported payment partners. Eligible refunds are sent to the original payment method and may take additional time to appear depending on the bank or provider.' },
  { title: 'Delivery and returns', body: 'Delivery estimates are not guarantees and can change due to address, stock or courier conditions. Returns are subject to the eligibility, time window and item-condition requirements shown by Shopore.' },
  { title: 'Account responsibility', body: 'Keep your login details private and provide accurate contact and delivery information. Contact support promptly if you believe your account is being used without permission.' },
];

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-[#f8f5f3] pb-20 pt-[92px] text-[#251d21]">
      <section className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <div className="rounded-[30px] border border-[#eadbd7] bg-white p-7 shadow-[0_20px_60px_rgba(70,35,45,0.07)] sm:p-11 lg:p-14">
          <div className="flex flex-col gap-8 border-b border-[#eadbd7] pb-9 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-600">Terms of use</p><h1 className="mt-4 text-[32px] font-black tracking-[-0.04em] sm:text-[54px]">The rules, in plain language.</h1><p className="mt-5 max-w-[680px] text-[14px] leading-7 text-[#75666d]">These terms explain the basic agreement for using Shopore, placing orders and interacting with our services.</p></div>
            <div className="shrink-0 rounded-2xl bg-[#251d21] px-5 py-4 text-white"><FileCheck2 size={20} className="text-rose-300" /><p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-white/45">Last updated</p><p className="mt-1 text-[12px] font-bold">30 June 2026</p></div>
          </div>

          <div className="mt-8 grid gap-7 lg:grid-cols-[220px_1fr]">
            <aside className="h-fit rounded-[20px] bg-rose-50 p-5 lg:sticky lg:top-[94px]"><Scale size={21} className="text-rose-700" /><h2 className="mt-4 text-[15px] font-black">Quick summary</h2><p className="mt-3 text-[12px] leading-6 text-[#796870]">Shop lawfully, provide correct details, pay securely and review product, delivery and return information before ordering.</p><Link href="/contact" className="mt-5 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 no-underline">Ask a question <ArrowRight size={12} /></Link></aside>
            <div className="space-y-2">
              {clauses.map((clause, index) => <article key={clause.title} className="grid gap-4 rounded-[18px] px-3 py-5 transition hover:bg-[#fcf7f8] sm:grid-cols-[40px_1fr] sm:px-5"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-[10px] font-black text-rose-700">{String(index + 1).padStart(2, '0')}</span><div><h2 className="text-[17px] font-black">{clause.title}</h2><p className="mt-3 text-[13px] leading-7 text-[#75666d]">{clause.body}</p></div></article>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
