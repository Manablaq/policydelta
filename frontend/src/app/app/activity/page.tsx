import { AppPageHeader } from "@/components/app-shell/app-shell";
import { Activity } from "lucide-react";

export default function ActivityPage() {
  return (
    <>
      <AppPageHeader
        eyebrow="Activity"
        title="Transaction lifecycle"
        description="PolicyDelta keeps consensus status, execution result, and finality distinct. Use the activity control in the top bar to inspect transactions submitted from this browser and preserved across reloads."
      />

      <div className="mt-8 panel px-6 py-20 text-center">
        <Activity
          size={22}
          className="mx-auto text-[var(--accent)]"
        />
        <h2 className="mt-4 font-semibold">
          Finality-aware tracking is active
        </h2>
        <p className="mx-auto mt-2 max-w-[540px] text-sm leading-6 text-[var(--muted)]">
          Successful execution automatically invalidates and refreshes PolicyDelta contract queries at Accepted and again at Finalized. No browser reload is required.
        </p>
      </div>
    </>
  );
}
