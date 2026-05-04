import EkubTypePage from '@/components/dashboard/ekub-type-page';

export default function WeeklyEkubPage() {
  return (
    <EkubTypePage
      title="Weekly EKUB"
      subtitle="60-week cycle for long-term traditional savings groups."
      customers={[]}
      ekubType="weekly"
    />
  );
}