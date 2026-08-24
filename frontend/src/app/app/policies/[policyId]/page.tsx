import { PolicyDetail } from "@/components/policy/policy-detail";

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{
    policyId: string;
  }>;
}) {
  const { policyId } = await params;

  return (
    <PolicyDetail
      policyId={decodeURIComponent(
        policyId,
      )}
    />
  );
}
