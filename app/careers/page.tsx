import InfoPage from '@/components/InfoPage';

export default function CareersPage() {
  return (
    <InfoPage
      eyebrow="Careers"
      title="Build retail experiences that feel simple and sharp."
      intro="We are always interested in people who care about product quality, customer experience, design, engineering, and operations."
      sections={[
        { title: 'Product & Design', body: 'Help shape shopping flows that are easy to understand, polished, and useful on every screen size.' },
        { title: 'Engineering', body: 'Build reliable storefront, cart, checkout, catalog, and account experiences with a strong eye for detail.' },
        { title: 'Operations', body: 'Support product quality, delivery coordination, returns, and customer communication.' },
        { title: 'How To Apply', body: 'Send your profile and area of interest to careers@shopore.com. We will reach out when a suitable role opens.' },
      ]}
    />
  );
}
