import {
  AccountOverview,
} from "@/components/account/account-overview";
import {
  AppPageHeader,
} from "@/components/app-shell/app-shell";

export default function AppOverviewPage() {
  return (
    <>
      <AppPageHeader
        eyebrow="Policy workspace"
        title="Authority at a glance"
        description="See the connected wallet's policies discovered automatically from Bradbury, live authority, pending consent requirements, and verified on-chain transaction history."
      />

      <AccountOverview />
    </>
  );
}
