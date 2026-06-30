import Link from 'next/link';
import { ArrowRight, BadgeIndianRupee, MapPin, PackageCheck, Truck } from 'lucide-react';

const journey = [
  ['01', 'Order confirmed', 'Your order appears in My Orders after checkout.'],
  ['02', 'Packed', 'The seller prepares and checks your item.'],
  ['03', 'Shipped', 'The courier picks up your package for transit.'],
  ['04', 'Delivered', 'The package reaches your confirmed address.'],
];

export default function DeliveryPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fff7ed] pb-20 pt-[92px] text-[#2a1c14]">
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-[30px] border border-orange-200 bg-white shadow-[0_22px_65px_rgba(154,76,20,0.09)] lg:grid-cols-[1fr_340px]">
          <div className="px-7 py-11 sm:px-11 lg:px-14 lg:py-14"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-600">Delivery policy</p><h1 className="mt-4 max-w-[700px] text-[32px] font-black leading-[1.08] tracking-[-0.04em] sm:text-[52px]">Clear updates from checkout to doorstep.</h1><p className="mt-6 max-w-[680px] text-[14px] leading-7 text-[#78675d]">Delivery estimates are shown before and after ordering, with progress available anytime from your account.</p></div>
          <div className="flex flex-col justify-center bg-[#e96923] p-8 text-white"><Truck size={40} strokeWidth={1.5} /><p className="mt-7 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-100">Standard estimate</p><strong className="mt-2 text-[30px] font-black">Up to 4 days</strong><p className="mt-2 text-[12px] leading-6 text-orange-100">Timelines may vary by address, product availability and courier service.</p></div>
        </div>

        <div className="py-12"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Your delivery journey</p><h2 className="mt-3 text-[28px] font-black">What happens after you order</h2></div>
        <div className="grid gap-4 md:grid-cols-4">{journey.map(([number, title, body]) => <article key={number} className="rounded-[22px] border border-orange-100 bg-white p-6"><span className="text-[11px] font-black text-orange-500">{number}</span><h3 className="mt-5 text-[16px] font-black">{title}</h3><p className="mt-3 text-[12px] leading-6 text-[#79685e]">{body}</p></article>)}</div>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          <Detail icon={BadgeIndianRupee} title="Delivery fees" body="The exact delivery fee is shown in your bag before placing an order. Orders above ₹300 may qualify for free delivery." />
          <Detail icon={MapPin} title="Address accuracy" body="Use a complete address, correct PIN code and reachable phone number to reduce failed delivery attempts." />
          <Detail icon={PackageCheck} title="Failed delivery" body="If delivery cannot be completed, the courier or our support team may contact you to arrange the next step." />
        </div>

        <div className="mt-7 flex flex-col gap-4 rounded-[22px] bg-[#2a1c14] px-7 py-6 text-white sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-[16px] font-black">Want the latest order update?</h3><p className="mt-1 text-[12px] text-white/55">Tracking and estimated dates are available in My Orders.</p></div><Link href="/profile?section=orders" className="inline-flex items-center gap-2 text-[12px] font-bold text-orange-300 no-underline">Track an order <ArrowRight size={14} /></Link></div>
      </section>
    </main>
  );
}

function Detail({ icon: Icon, title, body }: { icon: typeof Truck; title: string; body: string }) {
  return <article className="rounded-[22px] border border-orange-100 bg-white p-6"><Icon size={20} className="text-orange-600" /><h3 className="mt-5 text-[16px] font-black">{title}</h3><p className="mt-3 text-[12px] leading-6 text-[#79685e]">{body}</p></article>;
}
