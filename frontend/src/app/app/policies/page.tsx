import {
  WalletPolicies,
} from "@/components/account/wallet-policies";
import {
  AppPageHeader,
} from "@/components/app-shell/app-shell";
import {
  CreatePolicyPanel,
} from "@/components/policy/create-policy-panel";
import {
  PolicyLookup,
} from "@/components/policy/policy-lookup";

export default function PoliciesPage() {
  return (
    <>
      <AppPageHeader
        eyebrow="Policies"
        title="Policy registry"
        description="See the connected wallet's indexed policies, create new authority, import older owned policies, or inspect any exact PolicyDelta ID directly from Bradbury."
      />

      <section className="mt-8 space-y-4">
        <WalletPolicies />
        <CreatePolicyPanel />
        <PolicyLookup />
      </section>
    </>
  );
}
