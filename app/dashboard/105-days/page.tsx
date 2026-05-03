import EkubTypePage from '@/components/dashboard/ekub-type-page';

const customers105 = [
  {
    customerId: 'D105-001',
    fullName: 'Worku Desta',
    phone: '+251933000001',
    roundLabel: 'Day 45',
    round: 1,
    period: 45,
    paymentStatus: 'Paid' as const,
    receivedEkub: 'No' as const,
    amount: 150,
  },
];

export default function Days105EkubPage() {
  return (
    <EkubTypePage
      title="105-Day EKUB"
      subtitle="Special 107-period track for accelerated cycles."
      customers={customers105 as any}
      ekubType="105-days"
    />
  );
}