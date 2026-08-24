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
        description="See the connected wallet's indexed policies, live Bradbury authority, pending consent requirements, and verified transaction history."
      />

      <AccountOverview />
    </>
  );
}
