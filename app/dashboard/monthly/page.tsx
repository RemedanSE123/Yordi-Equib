import EkubTypePage from '@/components/dashboard/ekub-type-page';

const monthlyCustomers = [
  {
    customerId: 'MO-001',
    fullName: 'Genet Ayele',
    phone: '+251922000001',
    roundLabel: 'Meskeram',
    round: 1,
    period: 1,
    paymentStatus: 'Paid' as const,
    receivedEkub: 'No' as const,
    amount: 2000,
  },
  {
    customerId: 'MO-002',
    fullName: 'Yonas Berhanu',
    phone: '+251922000002',
    roundLabel: 'Meskeram',
    round: 1,
    period: 1,
    paymentStatus: 'Paid' as const,
    receivedEkub: 'Yes' as const,
    winnerRound: 'Meskeram',
    amount: 2000,
  },
];

export default function MonthlyEkubPage() {
  return (
    <EkubTypePage
      title="Monthly EKUB"
      subtitle="14-month Ethiopian calendar cycle for large-scale members."
      customers={monthlyCustomers as any}
      ekubType="monthly"
    />
  );
}