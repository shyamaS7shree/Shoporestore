import InfoPage from '@/components/InfoPage';

export default function HelpFaqsPage() {
  return (
    <InfoPage
      eyebrow="Help / FAQs"
      title="Quick answers for shopping, delivery, and returns."
      intro="Find the most common answers about orders, payments, delivery timelines, returns, and account support."
      sections={[
        { title: 'How do I track an order?', body: 'After checkout, order updates will appear in your account and will also be shared by email or SMS.' },
        { title: 'Can I return an item?', body: 'Eligible products can be returned or exchanged within the return window shown on the product page.' },
        { title: 'How do I change my address?', body: 'Before placing the order, choose Select Address from the bag page and update your delivery details.' },
        { title: 'Need More Help?', body: 'Write to shyamashreedas5@gmail.com with your order details and our team will help you.' },
      ]}
    />
  );
}
