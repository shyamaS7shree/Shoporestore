'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  Mail,
  Package,
  Phone,
  Send,
  User,
} from 'lucide-react';

const accountLinks = [
  {
    icon: Package,
    label: 'My Orders',
    sub: 'Track purchases, payment status and order history',
    href: '/profile?section=orders',
  },
  {
    icon: User,
    label: 'My Profile',
    sub: 'Update your name, mobile number and profile photo',
    href: '/profile',
  },
  {
    icon: Headphones,
    label: 'Help & Support',
    sub: 'Account help and support topics',
    href: '/profile?section=support',
  },
];

const subjects = ['Order help', 'Payment issue', 'Return or refund', 'Product question', 'Other'];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitted(false);
    setError('');

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          orderNo: formData.get('orderNo'),
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to send message');
      }

      form.reset();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 pb-16 pt-[118px] text-[#071225] sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <section className="grid overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="bg-[#071225] p-6 text-white sm:p-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-pink-200">Contact Shopore</p>
            <h1 className="mt-4 max-w-[360px] text-[34px] font-black leading-[1.05] tracking-[0] sm:text-[42px]">
              Tell us what needs attention.
            </h1>
            <p className="mt-4 max-w-[380px] text-[14px] leading-6 text-slate-300">
              For order and account work, jump straight to your account pages. For anything else, send a note here.
            </p>

            <div className="mt-9 grid gap-3">
              {accountLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group grid grid-cols-[42px_1fr_22px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4 text-white no-underline transition hover:border-pink-300/60 hover:bg-white/[0.12]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#071225]">
                      <Icon size={19} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-bold">{item.label}</span>
                      <span className="mt-1 block text-[12px] leading-5 text-slate-300">{item.sub}</span>
                    </span>
                    <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-pink-200" />
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 grid gap-3 border-t border-white/10 pt-7 text-[13px] text-slate-300">
              <a href="tel:+917969727777" className="flex items-center gap-3 text-slate-300 no-underline hover:text-white">
                <Phone size={16} />
                +91 796-972-7777
              </a>
              <a href="mailto:shyamashreedas5@gmail.com" className="flex items-center gap-3 text-slate-300 no-underline hover:text-white">
                <Mail size={16} />
                shyamashreedas5@gmail.com
              </a>
            </div>
          </aside>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mb-7">
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-pink-500">Write To Us</p>
              <h2 className="mt-2 text-[24px] font-black">Contact us</h2>
              <p className="mt-2 text-[13px] leading-6 text-slate-500">
                Share your details and we will get back to you as soon as possible.
              </p>
            </div>

            {submitted && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">
                <CheckCircle2 size={18} />
                Message sent successfully.
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field name="firstName" label="First Name" placeholder="First name" required />
                <Field name="lastName" label="Last Name" placeholder="Last name" required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field name="email" label="Email ID" placeholder="you@example.com" type="email" required />
                <Field name="phone" label="Mobile Number" placeholder="10 digit mobile number" required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field name="orderNo" label="Order No" placeholder="Optional" />
                <label className="block">
                  <span className="mb-2 block text-[12px] font-bold text-slate-700">Subject</span>
                  <select name="subject" required className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-[13px] outline-none transition focus:border-[#071225]">
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[12px] font-bold text-slate-700">Message</span>
                <textarea
                  required
                  name="message"
                  placeholder="Write your message here"
                  className="min-h-[132px] w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-[#071225]"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-fit items-center gap-2 rounded-lg bg-[#071225] px-7 text-[14px] font-black text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
                {submitting ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </section>
        </section>
      </div>

    </main>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-slate-300 px-4 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-[#071225]"
      />
    </label>
  );
}
