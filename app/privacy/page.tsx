import InfoPage from '@/components/InfoPage';

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Our Policies"
      title="Privacy Policy"
      intro="Your privacy matters. This page explains how Shopore handles information needed to run shopping, delivery, and support experiences."
      sections={[
        { title: 'Information We Use', body: 'We may use account, contact, address, order, and device information to process orders and improve service.' },
        { title: 'Payments', body: 'Payment details are handled through secure payment partners. Shopore does not store sensitive card data.' },
        { title: 'Communication', body: 'We may send order updates, support replies, and important account messages.' },
        { title: 'Your Choices', body: 'You can request support for account, order, or privacy questions at shyamashreedas5@gmail.com.' },
      ]}
    />
  );
}
