"use client";

import { BrandMark } from "@/components/brand/brand-mark";
import { Reveal } from "@/components/landing/reveal";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  Fingerprint,
  GitCompare,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import Link from "next/link";

const materialityClasses = [
  ["Permission expansion", "A new action or recipient becomes permitted."],
  ["Permission reduction", "Previously granted authority is removed."],
  ["Economic change", "Spending or economic authority changes."],
  ["Obligation change", "A duty is added, removed, or materially altered."],
  ["Safety-critical", "A safety constraint becomes stronger or weaker."],
  ["Mixed material", "More than one material category changes."],
];

const steps = [
  {
    number: "01",
    title: "Version the policy",
    copy: "Publish a new immutable policy version without silently replacing the policy users already authorized.",
  },
  {
    number: "02",
    title: "Review meaning",
    copy: "GenLayer validators compare the active and proposed versions against the policy's explicit materiality rules.",
  },
  {
    number: "03",
    title: "Protect consent",
    copy: "Non-material wording can activate automatically. Material changes wait for explicit principal consent.",
  },
  {
    number: "04",
    title: "Keep authority exact",
    copy: "The prior active version remains authoritative until the replacement is legitimately activated.",
  },
];

export function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(circle_at_62%_10%,var(--accent-soft),transparent_38%),radial-gradient(circle_at_8%_22%,var(--cyan-soft),transparent_28%)]" />

      <header className="sticky top-0 z-50 border-b border-transparent bg-[color:var(--background)/0.76] backdrop-blur-xl supports-[backdrop-filter]:bg-[color:var(--background)/0.72]">
        <div className="container-shell flex h-[76px] items-center justify-between">
          <Link
            href="/"
            aria-label="PolicyDelta home"
            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <BrandMark />
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-1 md:flex"
          >
            {[
              ["How it works", "#how-it-works"],
              ["Materiality", "#materiality"],
              ["Security", "#security"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/app"
              className="group inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--ink)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] dark:bg-white dark:text-[var(--ink)]"
            >
              Launch app
              <ArrowRight
                size={15}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </header>

      <section className="container-shell relative grid min-h-[calc(100vh-76px)] items-center gap-14 py-20 lg:grid-cols-[1.04fr_0.96fr] lg:py-28">
        <Reveal>
          <div className="max-w-[760px]">
            <div className="eyebrow">
              <Sparkles size={14} />
              Semantic consent infrastructure
            </div>

            <h1 className="mt-7 max-w-[760px] text-balance text-[clamp(3.35rem,7vw,6.7rem)] font-semibold leading-[0.9] tracking-[-0.067em] text-[var(--text)]">
              Policies evolve.
              <span className="block text-[var(--muted-strong)]">
                Consent shouldn&apos;t silently evolve with them.
              </span>
            </h1>

            <p className="mt-8 max-w-[650px] text-pretty text-lg leading-8 text-[var(--muted)] md:text-xl">
              PolicyDelta uses GenLayer to determine whether a policy changed
              enough in meaning that consent must be renewed—while preserving
              the last legitimately authorized version until that happens.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/app" className="button-primary group">
                Open PolicyDelta
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>

              <a
                href="#how-it-works"
                className="button-secondary"
              >
                See how it works
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[var(--muted)]">
              {[
                "Bradbury validated",
                "Finality-aware",
                "Explicit re-consent",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[var(--accent)]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto w-full max-w-[650px]">
            <div className="absolute -inset-12 -z-10 rounded-full bg-[var(--accent-soft)] blur-3xl" />

            <div className="panel overflow-hidden p-3 shadow-[var(--shadow-xl)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[var(--success)] shadow-[0_0_0_4px_var(--success-soft)]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
                    Semantic review
                  </span>
                </div>
                <span className="code-pill">Bradbury · 4221</span>
              </div>

              <div className="grid gap-3 p-3 md:grid-cols-2">
                <PolicyCard
                  label="Active · V3"
                  amount="1,000 GEN"
                  title="Authorized policy"
                  state="Authorized"
                  subdued
                />
                <PolicyCard
                  label="Proposed · V6"
                  amount="1,200 GEN"
                  title="Meaning changed"
                  state="Re-consent required"
                />
              </div>

              <div className="m-3 rounded-[20px] border border-[var(--line)] bg-[var(--surface-raised)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
                      Validator verdict
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="status-dot status-dot-warn" />
                      <p className="font-semibold tracking-[-0.02em]">
                        Economic change
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-warning">
                    Awaiting consent
                  </span>
                </div>

                <div className="mt-5 grid gap-2">
                  {[
                    ["Previous authority", "Remains active"],
                    ["Proposed authority", "Not authorized"],
                    ["Requires re-consent", "Yes"],
                  ].map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 rounded-xl bg-[var(--surface)] px-4 py-3 text-sm"
                    >
                      <span className="text-[var(--muted)]">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface)]">
        <div className="container-shell grid divide-y divide-[var(--line)] md:grid-cols-3 md:divide-x md:divide-y-0">
          <Metric
            value="7"
            label="Semantic change classes"
            copy="Explicit, reviewable outcomes."
          />
          <Metric
            value="2"
            label="Authorization gates"
            copy="Consensus plus principal consent when material."
          />
          <Metric
            value="0"
            label="Silent consent upgrades"
            copy="Old authority survives until legitimate activation."
          />
        </div>
      </section>

      <section
        id="how-it-works"
        className="container-shell scroll-mt-28 py-28 lg:py-36"
      >
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="A semantic control plane for changing policies."
            copy="Hashes can prove that bytes changed. PolicyDelta is designed to answer the harder question: did the meaning change enough that the old consent no longer covers it?"
          />
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.05}>
              <article className="group panel min-h-[260px] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold tracking-[0.14em] text-[var(--accent)]">
                    {step.number}
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--text)]"
                  />
                </div>
                <h3 className="mt-16 text-2xl font-semibold tracking-[-0.04em]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[520px] leading-7 text-[var(--muted)]">
                  {step.copy}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface)] py-28 lg:py-36">
        <div className="container-shell grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <div className="eyebrow">
                <GitCompare size={14} />
                Why hashes are not enough
              </div>
              <h2 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
                Integrity tells you the text changed. It does not tell you what
                the change means.
              </h2>
              <p className="mt-6 leading-8 text-[var(--muted)]">
                A one-word edit can expand economic authority. A full rewrite
                can preserve the same meaning. PolicyDelta binds consequences
                to semantic review rather than raw byte difference.
              </p>
            </div>
          </Reveal>

          <div className="space-y-4">
            <Reveal>
              <CompareRow
                icon={<Fingerprint size={19} />}
                label="Hash comparison"
                left="Different"
                right="Different"
                conclusion="Cannot determine materiality"
              />
            </Reveal>
            <Reveal delay={0.06}>
              <CompareRow
                icon={<GitCompare size={19} />}
                label="Semantic comparison"
                left="1000 GEN"
                right="1200 GEN"
                conclusion="ECONOMIC_CHANGE"
                positive
              />
            </Reveal>
            <Reveal delay={0.12}>
              <CompareRow
                icon={<LockKeyhole size={19} />}
                label="Authorization"
                left="V3 remains active"
                right="V6 blocked"
                conclusion="Re-consent required"
                positive
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="materiality"
        className="container-shell scroll-mt-28 py-28 lg:py-36"
      >
        <Reveal>
          <SectionHeading
            eyebrow="Materiality"
            title="Consequences are explicit, not buried in prose."
            copy="Validator consensus returns a constrained materiality class and a re-consent decision that the application can reason about safely."
          />
        </Reveal>

        <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {materialityClasses.map(([title, copy], index) => (
            <Reveal key={title} delay={index * 0.035}>
              <article className="panel h-full p-6">
                <CircleDot size={18} className="text-[var(--accent)]" />
                <h3 className="mt-8 text-lg font-semibold tracking-[-0.025em]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {copy}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        id="security"
        className="container-shell scroll-mt-28 pb-28 lg:pb-36"
      >
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] border border-[var(--line-strong)] bg-[var(--ink)] p-8 text-white shadow-[var(--shadow-xl)] md:p-12 lg:p-16 dark:bg-white dark:text-[var(--ink)]">
            <div className="pointer-events-none absolute right-[-10%] top-[-40%] size-[480px] rounded-full bg-[var(--accent)]/20 blur-3xl" />

            <div className="relative grid gap-14 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] dark:border-black/10 dark:bg-black/5">
                  <ShieldCheck size={14} />
                  Built around authority safety
                </div>

                <h2 className="mt-7 max-w-[720px] text-balance text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
                  A pending policy should never quietly become permission.
                </h2>

                <p className="mt-6 max-w-[670px] leading-8 text-white/65 dark:text-black/60">
                  Rejected, expired, superseded, and awaiting-consent versions
                  remain unauthorized. The application keeps consensus state,
                  execution state, and finality visually distinct.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  "Accepted is never displayed as Finalized",
                  "Material versions wait for explicit principal consent",
                  "Expired open versions can be recovered without trapping the policy",
                  "Superseded versions fail closed across review and consent paths",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 dark:border-black/10 dark:bg-black/[0.04]"
                  >
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-[var(--accent)]"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="container-shell py-24">
          <Reveal>
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="eyebrow">
                  <Waypoints size={14} />
                  Live on Bradbury
                </div>
                <h2 className="mt-6 max-w-[850px] text-balance text-4xl font-semibold tracking-[-0.055em] md:text-6xl">
                  Make policy evolution visible, reviewable, and consent-safe.
                </h2>
              </div>

              <Link href="/app" className="button-primary group">
                Launch application
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </Reveal>

          <div className="mt-20 flex flex-col gap-8 border-t border-[var(--line)] pt-8 md:flex-row md:items-center md:justify-between">
            <BrandMark />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
              <span>GenLayer Bradbury</span>
              <span aria-hidden="true">·</span>
              <span>Chain 4221</span>
              <a
                href="https://explorer-bradbury.genlayer.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-[var(--text)]"
              >
                Explorer
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PolicyCard({
  label,
  amount,
  title,
  state,
  subdued = false,
}: {
  label: string;
  amount: string;
  title: string;
  state: string;
  subdued?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-5 ${
        subdued
          ? "border-[var(--line)] bg-[var(--surface)]"
          : "border-[var(--accent-line)] bg-[var(--accent-soft)]"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-9 text-3xl font-semibold tracking-[-0.055em]">
        {amount}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">{title}</p>
      <div className="mt-7 flex items-center gap-2 text-xs font-medium">
        <span
          className={`size-2 rounded-full ${
            subdued ? "bg-[var(--success)]" : "bg-[var(--warning)]"
          }`}
        />
        {state}
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
  copy,
}: {
  value: string;
  label: string;
  copy: string;
}) {
  return (
    <div className="px-0 py-8 md:px-8 lg:px-12">
      <div className="text-4xl font-semibold tracking-[-0.055em]">{value}</div>
      <div className="mt-3 text-sm font-semibold">{label}</div>
      <div className="mt-1 text-sm text-[var(--muted)]">{copy}</div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="max-w-[850px]">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.055em] md:text-6xl">
        {title}
      </h2>
      <p className="mt-6 max-w-[700px] text-lg leading-8 text-[var(--muted)]">
        {copy}
      </p>
    </div>
  );
}

function CompareRow({
  icon,
  label,
  left,
  right,
  conclusion,
  positive = false,
}: {
  icon: React.ReactNode;
  label: string;
  left: string;
  right: string;
  conclusion: string;
  positive?: boolean;
}) {
  return (
    <article className="panel p-6">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="grid size-9 place-items-center rounded-xl bg-[var(--surface-strong)] text-[var(--muted-strong)]">
          {icon}
        </span>
        {label}
      </div>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Active
          </div>
          <div className="mt-2 font-medium">{left}</div>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Proposed
          </div>
          <div className="mt-2 font-medium">{right}</div>
        </div>
      </div>

      <div
        className={`mt-3 rounded-xl px-4 py-3 text-sm font-medium ${
          positive
            ? "bg-[var(--accent-soft)] text-[var(--accent-text)]"
            : "bg-[var(--surface-strong)] text-[var(--muted-strong)]"
        }`}
      >
        {conclusion}
      </div>
    </article>
  );
}
