import EkubTypePage from '@/components/dashboard/ekub-type-page';

export default function MonthlyEkubPage() {
  return (
    <EkubTypePage
      title="Monthly EKUB"
      subtitle="Track monthly contributions and lottery winners across Ethiopian months."
      customers={[]}
      ekubType="monthly"
    />
  );
}