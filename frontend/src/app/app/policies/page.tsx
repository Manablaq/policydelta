import { AppPageHeader } from "@/components/app-shell/app-shell";
import { CreatePolicyPanel } from "@/components/policy/create-policy-panel";
import { PolicyLookup } from "@/components/policy/policy-lookup";

export default function PoliciesPage() {
  return (
    <>
      <AppPageHeader
        eyebrow="Policies"
        title="Policy registry"
        description="Create a policy or inspect an exact PolicyDelta ID directly against Bradbury. The interface never invents an enumerable registry the contract does not expose."
      />

      <section className="mt-8 space-y-4">
        <CreatePolicyPanel />
        <PolicyLookup />
      </section>
    </>
  );
}
