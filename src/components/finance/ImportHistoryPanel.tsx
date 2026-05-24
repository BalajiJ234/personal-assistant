"use client";

import type { ImportHistoryRecord } from "@/types/finance";

interface ImportHistoryPanelProps {
  records: ImportHistoryRecord[];
  isLoading?: boolean;
}

export default function ImportHistoryPanel({
  records,
  isLoading = false,
}: ImportHistoryPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-700 bg-gray-800/40 px-4 py-6 text-center">
        <svg
          className="w-5 h-5 animate-spin text-gray-500 mx-auto"
          fill="none"
          viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700 bg-gray-800/40 px-4 py-6 text-center">
        <p className="text-sm text-gray-500">No imports yet.</p>
        <p className="text-xs text-gray-600 mt-1">
          Your import history will appear here after your first successful import.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gray-800/80 px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-200">Import History</h3>
        <p className="text-xs text-gray-500 mt-0.5">Last {records.length} imports</p>
      </div>

      <ul className="divide-y divide-gray-700/50">
        {records.map((record) => (
          <HistoryRow key={record.id} record={record} />
        ))}
      </ul>
    </div>
  );
}

// ─── Row ───────────────────────────────────────────────────────────────────

function HistoryRow({ record }: { record: ImportHistoryRecord }) {
  const date = new Date(record.createdAt);
  const formattedDate = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const sourceIcon = record.sourceType === "file" ? "📄" : "💬";
  const sourceName =
    record.sourceType === "file"
      ? record.fileName ?? "File upload"
      : "Chat message";

  return (
    <li className="px-4 py-3 flex items-center gap-4 hover:bg-gray-700/30 transition-colors">
      {/* Icon */}
      <span className="text-lg shrink-0">{sourceIcon}</span>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 truncate">{sourceName}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formattedDate} · {formattedTime}
        </p>
      </div>

      {/* Counts */}
      <div className="flex items-center gap-3 shrink-0">
        <CountPill
          count={record.importedCount}
          label="imported"
          color="text-emerald-400"
        />
        {record.skippedCount > 0 && (
          <CountPill
            count={record.skippedCount}
            label="skipped"
            color="text-gray-400"
          />
        )}
        {record.duplicateCount > 0 && (
          <CountPill
            count={record.duplicateCount}
            label="dupes"
            color="text-yellow-400"
          />
        )}
      </div>
    </li>
  );
}

function CountPill({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-sm font-semibold ${color}`}>{count}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}
