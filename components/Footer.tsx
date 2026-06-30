'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  ArrowUp,
  Headphones,
  Instagram,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { subscribeNewsletter } from '@/lib/api';

const shopLinks = [
  { label: 'Men', href: '/men/topwear' },
  { label: 'Women', href: '/women' },
  { label: 'Kids', href: '/kids/boys-clothing' },
  { label: 'Home', href: '/home' },
  { label: 'Beauty', href: '/beauty/makeup' },
  { label: 'GenZ', href: '/genz/fashion' },
];

const helpLinks = [
  { label: 'My Account', href: '/profile' },
  { label: 'Track Orders', href: '/profile?section=orders' },
  { label: 'Help & FAQs', href: '/help-faqs' },
  { label: 'Contact Us', href: '/contact' },
];

const policyLinks = [
  { label: 'About Shopore', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Delivery Policy', href: '/delivery-policy' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
];

const benefits = [
  { icon: Truck, title: 'Free delivery', text: 'Orders above ₹300' },
  { icon: ShieldCheck, title: 'Secure payment', text: 'Protected checkout' },
  { icon: RotateCcw, title: 'Easy returns', text: '7-day support' },
  { icon: Headphones, title: 'Need help?', text: 'We are here for you' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    setSubscribeMessage('');
    const result = await subscribeNewsletter({ email: email.trim() });

    if (result?.success) {
      setEmail('');
      setSubscribeMessage('You are on the list. Welcome to Shopore!');
    } else {
      setSubscribeMessage(result?.message || 'Could not subscribe. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <footer className="border-t border-[#393431] bg-[#1d1b1a] font-sans text-[#f8f4f1]">
      <div className="border-b border-white/10 bg-[#24211f]">
        <div className="mx-auto grid max-w-[1480px] grid-cols-2 px-4 sm:px-6 md:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="flex items-center gap-3 border-b border-white/10 px-3 py-5 md:border-b-0 md:border-r md:px-5 md:last:border-r-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#735263] bg-[#33272d] text-[#f39abb]">
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-[13px] font-bold text-white">{benefit.title}</span>
                  <span className="mt-0.5 block text-[11px] text-white/45">{benefit.text}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[1480px] px-6 py-12 sm:px-8 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.62fr_0.72fr_0.78fr_1.25fr] lg:gap-10">
          <div>
            <Link href="/" className="text-[30px] font-black tracking-[0.16em] text-white no-underline">
              SHOPORE
            </Link>
            <p className="mt-5 max-w-[310px] text-[13px] leading-6 text-[#b6ada8]">
              Fashion, beauty and home favourites for everyday shopping—simple, secure and made for you.
            </p>
            <div className="mt-6 space-y-3">
              <a href="tel:+917969727777" className="flex w-fit items-center gap-3 text-[12px] text-[#d1c8c3] no-underline transition hover:text-white">
                <Phone size={14} className="text-[#f18aaf]" /> +91 796-972-7777
              </a>
              <a href="mailto:shyamashreedas5@gmail.com" className="flex w-fit items-center gap-3 text-[12px] text-[#d1c8c3] no-underline transition hover:text-white">
                <Mail size={14} className="text-[#f18aaf]" /> shyamashreedas5@gmail.com
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Customer Care" links={helpLinks} />
          <FooterColumn title="Company" links={policyLinks} />

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f18aaf]">Newsletter</p>
            <h3 className="mt-3 max-w-[290px] text-[20px] font-bold leading-7 text-white">
              A little more style in your inbox.
            </h3>
            <p className="mt-2 text-[12px] leading-5 text-[#aaa19c]">New arrivals, offers and shopping inspiration—occasionally.</p>

            <form onSubmit={handleSubscribe} className="mt-5">
              <div className="flex h-12 overflow-hidden rounded-sm border border-white/20 bg-[#24211f] transition focus-within:border-[#f18aaf]">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email address"
                  aria-label="Email address"
                  className="min-w-0 flex-1 bg-transparent px-4 text-[12px] text-white outline-none placeholder:text-white/35"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="Subscribe to newsletter"
                  className="flex w-12 cursor-pointer items-center justify-center border-l border-white/15 bg-[#f7f1ed] text-[#211d1b] transition hover:bg-[#f18aaf] hover:text-white disabled:cursor-wait disabled:opacity-60"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              {subscribeMessage && (
                <p className="mt-2 text-[11px] leading-4 text-[#c9bdb7]" aria-live="polite">{subscribeMessage}</p>
              )}
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-white/40">© {currentYear} Shopore. All rights reserved.</p>

          <div className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/shyamashree4/"
              target="_blank"
              rel="noreferrer"
              aria-label="Shopore on Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/65 transition hover:border-[#f18aaf] hover:text-[#f18aaf]"
            >
              <Instagram size={14} />
            </a>
            <a
              href="https://x.com/Shyamashre25747"
              target="_blank"
              rel="noreferrer"
              aria-label="Shopore on X"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[12px] font-black text-white/65 transition hover:border-[#f18aaf] hover:text-[#f18aaf]"
            >
              𝕏
            </a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="ml-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#f7f1ed] text-[#211d1b] transition hover:-translate-y-0.5 hover:bg-[#f18aaf] hover:text-white"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-white">{title}</h3>
      <div className="mt-5 space-y-3">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="block w-fit text-[13px] text-[#aaa19c] no-underline transition hover:translate-x-0.5 hover:text-[#f18aaf]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
