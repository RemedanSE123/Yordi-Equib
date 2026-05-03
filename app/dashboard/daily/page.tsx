import EkubTypePage from '@/components/dashboard/ekub-type-page';

const dailyCustomers = [
  {
    customerId: 'DA-001',
    fullName: 'Abebe Bekele',
    phone: '+251905000001',
    roundLabel: 'Day 12',
    round: 1,
    period: 12,
    paymentStatus: 'Paid' as const,
    receivedEkub: 'Yes' as const,
    winnerRound: 'Day 5',
    amount: 100,
  },
  {
    customerId: 'DA-002',
    fullName: 'Selam Taye',
    phone: '+251905000002',
    roundLabel: 'Day 12',
    round: 1,
    period: 12,
    paymentStatus: 'Paid' as const,
    receivedEkub: 'No' as const,
    amount: 100,
  },
  {
    customerId: 'DA-003',
    fullName: 'Hanna Mamo',
    phone: '+251905000003',
    roundLabel: 'Day 12',
    round: 1,
    period: 12,
    paymentStatus: 'Unpaid' as const,
    receivedEkub: 'No' as const,
    amount: 100,
  },
  {
    customerId: 'DA-004',
    fullName: 'Tarek Alemu',
    phone: '+251905000004',
    roundLabel: 'Day 12',
    round: 1,
    period: 12,
    paymentStatus: 'Paid' as const,
    receivedEkub: 'Yes' as const,
    winnerRound: 'Day 8',
    amount: 100,
  },
];

export default function DailyEkubPage() {
  return (
    <EkubTypePage
      title="Daily EKUB"
      subtitle="30-day cycle with multi-day selection and payment tracking for each customer."
      customers={dailyCustomers as any}
      ekubType="daily"
    />
  );
}