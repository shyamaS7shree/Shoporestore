'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is Shopore?',
    answer:
      'Shopore is a modern eCommerce platform that offers a curated selection of high-quality products. We aim to provide the best shopping experience with fast delivery, secure checkout, and excellent customer service.',
  },
  {
    question: 'How do I place an order?',
    answer:
      'Browse our products, add items to your cart, and proceed to checkout. Fill in your shipping and payment information to complete your purchase. You will receive an order confirmation email immediately.',
  },
  {
    question: 'What are your shipping rates and delivery times?',
    answer:
      'We offer free shipping on orders over $50. Standard delivery takes 5-7 business days, while express shipping takes 2-3 business days. Shipping costs vary based on location and shipping method.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'We offer a 30-day return policy on all unused items in original packaging. To start a return, contact our customer service team with your order number. Refunds are processed within 5-7 business days after we receive your return.',
  },
  {
    question: 'Is my payment information secure?',
    answer:
      'Yes, we use industry-standard SSL encryption and secure payment gateways to protect your personal and payment information. We never store your complete credit card details on our servers.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'After your order ships, you will receive a tracking number via email. Use this number on our tracking page or the carrier website to monitor your delivery in real-time.',
  },
  {
    question: 'Do you offer customer support?',
    answer:
      'Yes! Our customer support team is available via email and contact form. We typically respond within 24 hours. Visit our Contact page to reach out with any questions or concerns.',
  },
  {
    question: 'Can I change or cancel my order?',
    answer:
      'Orders can be modified or cancelled within 24 hours of placement. After that time, the order is processed for shipment. Contact our support team immediately if you need to make changes.',
  },
];

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            eCommerce FAQ
          </h2>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about Shopore
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-card rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-6 py-4 md:px-8 md:py-5 flex justify-between items-center hover:bg-muted transition-colors"
              >
                <h3 className="text-left text-lg font-semibold text-foreground">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 ml-4 transition-transform ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedIndex === index && (
                <div className="px-6 md:px-8 py-4 md:py-5 bg-background border-t border-border">
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
