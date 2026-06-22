import InfoPage from '@/components/InfoPage';

export default function TermsOfUsePage() {
  return (
    <InfoPage
      eyebrow="Our Policies"
      title="Terms of Use"
      intro="These terms explain the basic rules for using Shopore, placing orders, and interacting with our services."
      sections={[
        { title: 'Use Of Website', body: 'Use Shopore for lawful shopping activity only. Do not misuse, copy, disrupt, or attempt to harm the service.' },
        { title: 'Product Information', body: 'We work to keep prices, product details, and availability accurate, but they may change without notice.' },
        { title: 'Orders', body: 'Orders are confirmed after successful checkout and may be cancelled if payment, stock, or verification issues occur.' },
        { title: 'Contact', body: 'For terms-related questions, contact shyamashreedas5@gmail.com.' },
      ]}
    />
  );
}
