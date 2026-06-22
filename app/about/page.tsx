import InfoPage from '@/components/InfoPage';

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About Shopore"
      title="A modern shopping experience for everyday style."
      intro="Shopore brings fashion, beauty, home, and lifestyle essentials into one clean, easy-to-use store built for quick discovery and confident checkout."
      sections={[
        { title: 'What We Do', body: 'We curate practical, stylish products across categories so customers can browse with less noise and more confidence.' },
        { title: 'Our Promise', body: 'Clear prices, simple returns, fast delivery, and a product experience that feels calm, useful, and trustworthy.' },
        { title: 'Designed For You', body: 'From category pages to the bag flow, every screen is shaped for scanning, choosing, and checking out quickly.' },
        { title: 'Support', body: 'Need help with an order or product? Our support team is ready to guide you through the next step.' },
      ]}
    />
  );
}
