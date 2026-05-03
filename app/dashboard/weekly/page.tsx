import EkubTypePage from '@/components/dashboard/ekub-type-page';

const weeklyCustomers = [
  {
    customerId: 'WK-001',
    fullName: 'Kebede Kassahun',
    phone: '+251911000001',
    roundLabel: 'Week 4',
    round: 1,
    period: 4,
    paymentStatus: 'Paid' as const,
    receivedEkub: 'No' as const,
    amount: 500,
  },
  {
    customerId: 'WK-002',
    fullName: 'Mulugeta Tesfaye',
    phone: '+251911000002',
    roundLabel: 'Week 4',
    round: 1,
    period: 4,
    paymentStatus: 'Unpaid' as const,
    receivedEkub: 'No' as const,
    amount: 500,
  },
];

export default function WeeklyEkubPage() {
  return (
    <EkubTypePage
      title="Weekly EKUB"
      subtitle="60-week cycle for long-term traditional savings groups."
      customers={weeklyCustomers as any}
      ekubType="weekly"
    />
  );
}