"use client";

import { BrandMark } from "@/components/brand/brand-mark";
import { PrincipalAppealCenter } from "@/components/account/principal-appeal-center";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TransactionCenter } from "@/components/transaction/transaction-center";
import { WalletButton } from "@/components/wallet/wallet-button";
import { cn } from "@/lib/utils";
import {
  Activity,
  BookOpen,
  FileText,
  GitCompare,
  LayoutDashboard,
  Menu,
  Network,
  Search,
  ShieldCheck,
  Waypoints,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    href: "/app",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/app/policies",
    label: "Policies",
    icon: FileText,
  },
  {
    href: "/app/compare",
    label: "Compare",
    icon: GitCompare,
  },
  {
    href: "/app/activity",
    label: "Activity",
    icon: Activity,
  },
  {
    href: "/app/evidence",
    label: "Evidence",
    icon: Waypoints,
  },
];

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] border-r border-[var(--line)] bg-[var(--surface)] lg:flex lg:flex-col">
        <div className="flex h-[76px] items-center border-b border-[var(--line)] px-6">
          <Link href="/">
            <BrandMark />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Workspace
          </p>

          {navItems.map((item) => {
            const active =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent-text)] ring-1 ring-inset ring-[var(--accent-line)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]",
                )}
              >
                <item.icon size={17} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Network size={14} className="text-[var(--accent)]" />
              Bradbury testnet
            </div>
            <div className="mt-2 font-mono text-[11px] text-[var(--muted)]">
              Chain ID · 4221
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="size-2 rounded-full bg-[var(--success)]" />
              Network configured
            </div>
          </div>

          <Link
            href="/"
            className="mt-3 flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--text)]"
          >
            <BookOpen size={14} />
            Product overview
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-[var(--line)] bg-[color:var(--background)/0.84] px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="mr-3 grid size-10 place-items-center rounded-xl border border-[var(--line)] lg:hidden"
          >
            <Menu size={18} />
          </button>

          <Link
            href="/app/policies"
            className="hidden max-w-[360px] flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--muted)] transition hover:border-[var(--line-strong)] hover:text-[var(--text)] md:flex"
          >
            <Search size={16} />
            Find a policy
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.1em]">
              Live
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-medium sm:flex">
              <span className="size-2 rounded-full bg-[var(--success)]" />
              Bradbury
            </div>

            <TransactionCenter />
            <ThemeToggle />
            <WalletButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <PrincipalAppealCenter />
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            aria-label="Close navigation backdrop"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(86vw,320px)] border-r border-[var(--line)] bg-[var(--background)] p-4 shadow-2xl">
            <div className="flex h-14 items-center justify-between">
              <BrandMark />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="grid size-10 place-items-center rounded-xl border border-[var(--line)]"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-6 space-y-1">
              {navItems.map((item) => {
                const active =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(
                        item.href,
                      );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={cn(
                      "flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent-text)] ring-1 ring-inset ring-[var(--accent-line)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
                    )}
                  >
                    <item.icon
                      size={18}
                      strokeWidth={1.8}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

export function AppPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-[var(--line)] pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--accent)]">
          <ShieldCheck size={14} />
          {eyebrow}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-[680px] leading-7 text-[var(--muted)]">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
