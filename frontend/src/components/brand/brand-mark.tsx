import { cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        aria-hidden="true"
        className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[12px] border border-[var(--line-strong)] bg-[var(--ink)] shadow-[var(--shadow-sm)] dark:bg-white"
      >
        <span className="absolute left-[9px] top-[8px] h-[17px] w-[5px] rounded-full bg-[var(--accent)]" />
        <span className="absolute right-[8px] top-[8px] h-[5px] w-[12px] rounded-full bg-white dark:bg-[var(--ink)]" />
        <span className="absolute bottom-[8px] right-[8px] h-[5px] w-[8px] rounded-full bg-white/65 dark:bg-[var(--ink)]/55" />
      </div>

      {!compact && (
        <div className="leading-none">
          <div className="font-semibold tracking-[-0.035em] text-[var(--text)]">
            PolicyDelta
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Consent integrity
          </div>
        </div>
      )}
    </div>
  );
}
