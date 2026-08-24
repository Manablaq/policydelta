import { AppPageHeader } from "@/components/app-shell/app-shell";
import { CompareWorkspace } from "@/components/policy/compare-workspace";

type CompareSearchParams = {
  policyId?: string;
  from?: string;
  to?: string;
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<CompareSearchParams>;
}) {
  const params =
    await searchParams;

  const from =
    Number(params.from ?? 0);

  const to =
    Number(params.to ?? 0);

  return (
    <>
      <AppPageHeader
        eyebrow="Compare"
        title="Policy version comparison"
        description="Inspect literal text changes side-by-side while keeping PolicyDelta's stored GenLayer materiality verdict clearly separate from presentation-layer highlighting."
      />

      <section className="mt-8">
        <CompareWorkspace
          initialPolicyId={
            params.policyId ?? ""
          }
          initialFrom={
            Number.isInteger(from)
              ? from
              : 0
          }
          initialTo={
            Number.isInteger(to)
              ? to
              : 0
          }
        />
      </section>
    </>
  );
}
