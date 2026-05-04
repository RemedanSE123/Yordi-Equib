import EkubTypePage from '@/components/dashboard/ekub-type-page';

export default function ShareEkubPage() {
  return (
    <EkubTypePage
      title="Share EKUB"
      subtitle="Track shares and contributions for the community investment group."
      customers={[]}
      ekubType="share"
    />
  );
}