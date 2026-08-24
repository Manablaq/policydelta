import {
  WalletActivity,
} from "@/components/account/wallet-activity";
import {
  AppPageHeader,
} from "@/components/app-shell/app-shell";

export default function ActivityPage() {
  return (
    <>
      <AppPageHeader
        eyebrow="Activity"
        title="Transaction lifecycle"
        description="Review verified PolicyDelta activity associated with the connected wallet while keeping consensus status, execution result, and finality distinct."
      />

      <WalletActivity />
    </>
  );
}
