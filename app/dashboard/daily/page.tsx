import EkubTypePage from '@/components/dashboard/ekub-type-page';

export default function DailyEkubPage() {
  return (
    <EkubTypePage
      title="Daily EKUB"
      subtitle="30-day cycle with multi-day selection and payment tracking for each customer."
      customers={[]}
      ekubType="daily"
    />
  );
}