import InfoPage from '@/components/InfoPage';

export default function DeliveryPolicyPage() {
  return (
    <InfoPage
      eyebrow="Our Policies"
      title="Delivery Policy"
      intro="Shopore aims to make delivery clear, trackable, and reliable from bag to doorstep."
      sections={[
        { title: 'Delivery Timelines', body: 'Estimated delivery dates are shown during checkout and may vary by address, product, and courier availability.' },
        { title: 'Delivery Fee', body: 'Delivery fees are shown in the bag before placing an order. Some orders may qualify for free delivery.' },
        { title: 'Address Accuracy', body: 'Please provide a complete delivery address and reachable phone number to avoid delays.' },
        { title: 'Failed Delivery', body: 'If delivery cannot be completed, our courier or support team may contact you for the next step.' },
      ]}
    />
  );
}
