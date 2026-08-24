import { AppPageHeader } from "@/components/app-shell/app-shell";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  GitCompare,
  ShieldCheck,
} from "lucide-react";

export default function AppOverviewPage() {
  return (
    <>
      <AppPageHeader
        eyebrow="Policy workspace"
        title="Authority at a glance"
        description="Track active policy authority, pending semantic reviews, consent requirements, and GenLayer transaction finality without losing the difference between them."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active policies"
          value="—"
          detail="Connect live reads next"
          icon={<ShieldCheck size={18} />}
        />
        <StatCard
          label="Awaiting consent"
          value="—"
          detail="Material proposals"
          icon={<Clock3 size={18} />}
        />
        <StatCard
          label="Open proposals"
          value="—"
          detail="Across your policies"
          icon={<FileText size={18} />}
        />
        <StatCard
          label="Finality tracking"
          value="On"
          detail="No manual refresh"
          icon={<CheckCircle2 size={18} />}
        />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
                Policy activity
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
                Live policy inspection
              </h2>
            </div>
            <GitCompare size={19} className="text-[var(--muted)]" />
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface)] px-6 py-16 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--surface-strong)] text-[var(--muted)]">
              <FileText size={20} />
            </div>
            <h3 className="mt-4 font-semibold">
              Bradbury reads are live
            </h3>
            <p className="mx-auto mt-2 max-w-[440px] text-sm leading-6 text-[var(--muted)]">
              Open Policies to inspect an exact PolicyDelta ID, its active
              authority, open proposal, semantic verdict, and version lineage
              directly from the deployed Bradbury contract.
            </p>
          </div>
        </div>

        <div className="panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
            Network
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
            Bradbury testnet
          </h2>

          <div className="mt-8 space-y-2">
            {[
              ["Chain ID", "4221"],
              ["Contract", "0x034e…e17E"],
              ["Consensus", "Finality-aware"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-[var(--surface)] px-4 py-3 text-sm"
              >
                <span className="text-[var(--muted)]">{label}</span>
                <span className="font-mono text-xs font-semibold">{value}</span>
              </div>
            ))}
          </div>

          <a
            href="https://explorer-bradbury.genlayer.com/"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-text)]"
          >
            Open explorer
            <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="panel p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-[var(--surface-strong)] text-[var(--muted-strong)]">
          {icon}
        </span>
      </div>
      <p className="mt-8 text-3xl font-semibold tracking-[-0.055em]">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{detail}</p>
    </article>
  );
}
