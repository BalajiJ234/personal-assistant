"use client";

interface DuplicateWarningCardProps {
  count: number;
  onSkipAll: () => void;
  onImportAnyway: () => void;
}

export default function DuplicateWarningCard({
  count,
  onSkipAll,
  onImportAnyway,
}: DuplicateWarningCardProps) {
  if (count === 0) return null;

  return (
    <div className="rounded-xl border border-yellow-700/60 bg-yellow-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="text-yellow-400 text-lg mt-0.5">⚠️</span>
        <div>
          <p className="text-sm font-medium text-yellow-300">
            {count} possible duplicate{count > 1 ? "s" : ""} detected
          </p>
          <p className="text-xs text-yellow-500 mt-0.5">
            These entries may already exist in WealthPulse. Review before confirming.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSkipAll}
          className="px-3 py-1.5 text-xs rounded-lg border border-yellow-700 text-yellow-400 hover:bg-yellow-900/40 transition-colors">
          Skip all duplicates
        </button>
        <button
          onClick={onImportAnyway}
          className="px-3 py-1.5 text-xs rounded-lg bg-yellow-800/50 text-yellow-300 hover:bg-yellow-800 transition-colors">
          Import anyway
        </button>
      </div>
    </div>
  );
}
