import EkubTypePage from '@/components/dashboard/ekub-type-page';

const shareCustomers = [
  {
    customerId: 'SH-001',
    fullName: 'Sara Teshome',
    phone: '+251944000001',
    roundLabel: 'Day 10',
    round: 1,
    period: 10,
    paymentStatus: 'Paid' as const,
    receivedEkub: 'No' as const,
    amount: 1000,
  },
];

export default function ShareEkubPage() {
  return (
    <EkubTypePage
      title="Share EKUB"
      subtitle="60-day investment-based share cycle."
      customers={shareCustomers as any}
      ekubType="share"
    />
  );
}