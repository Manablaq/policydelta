import { AppPageHeader } from "@/components/app-shell/app-shell";
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

const contract =
  "0x034eA00BFca3a7dBa0DBD72398aE5ddb5237e17E";

const deploymentTx =
  "0x66e01ac9797ebdf53a17fc56090bad546940adf3614350c362c711457b9b92ac";

export default function EvidencePage() {
  return (
    <>
      <AppPageHeader
        eyebrow="Evidence"
        title="Bradbury verification"
        description="Reviewer-facing deployment facts for the frozen PolicyDelta v1 Intelligent Contract."
      />

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="panel p-6">
          <ShieldCheck
            size={19}
            className="text-[var(--accent)]"
          />
          <h2 className="mt-5 text-xl font-semibold tracking-[-0.035em]">
            Deployed contract
          </h2>
          <p className="mt-3 break-all font-mono text-xs leading-6 text-[var(--muted)]">
            {contract}
          </p>
          <a
            href={`https://explorer-bradbury.genlayer.com/address/${contract}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-text)]"
          >
            Open contract
            <ExternalLink size={14} />
          </a>
        </article>

        <article className="panel p-6">
          <CheckCircle2
            size={19}
            className="text-[var(--success)]"
          />
          <h2 className="mt-5 text-xl font-semibold tracking-[-0.035em]">
            Deployment transaction
          </h2>
          <p className="mt-3 break-all font-mono text-xs leading-6 text-[var(--muted)]">
            {deploymentTx}
          </p>
          <a
            href={`https://explorer-bradbury.genlayer.com/tx/${deploymentTx}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-text)]"
          >
            Open transaction
            <ExternalLink size={14} />
          </a>
        </article>
      </section>
    </>
  );
}
