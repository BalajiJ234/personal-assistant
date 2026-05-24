"use client";

import { useState } from "react";
import type { ValidationError, DuplicateWarning, ValidationSummary } from "@/types/finance";

interface ValidationSummaryProps {
  summary: ValidationSummary;
}

export default function ValidationSummaryPanel({ summary }: ValidationSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  const { valid, invalid, needsReview, ignored, errors, warnings, duplicates } = summary;
  const total = valid + invalid + needsReview + ignored;
  const hasIssues = errors.length > 0 || warnings.length > 0 || duplicates.length > 0;

  if (total === 0) return null;

  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden">
      {/* Summary bar */}
      <div className="bg-gray-800/80 px-4 py-3 flex flex-wrap items-center gap-4">
        {/* Counts */}
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <StatPill
            count={valid}
            label="Ready"
            color="text-emerald-400"
            dotColor="bg-emerald-400"
          />
          {needsReview > 0 && (
            <StatPill
              count={needsReview}
              label="Review"
              color="text-yellow-400"
              dotColor="bg-yellow-400"
            />
          )}
          {invalid > 0 && (
            <StatPill
              count={invalid}
              label="Invalid"
              color="text-red-400"
              dotColor="bg-red-400"
            />
          )}
          {ignored > 0 && (
            <StatPill
              count={ignored}
              label="Ignored"
              color="text-gray-400"
              dotColor="bg-gray-500"
            />
          )}
          {duplicates.length > 0 && (
            <StatPill
              count={duplicates.length}
              label="Duplicates"
              color="text-orange-400"
              dotColor="bg-orange-400"
            />
          )}
        </div>

        {/* Expand toggle */}
        {hasIssues && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 transition-colors">
            {expanded ? "Hide details" : "Show details"}
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expandable details */}
      {expanded && hasIssues && (
        <div className="divide-y divide-gray-700/50">
          {/* Errors */}
          {errors.length > 0 && (
            <IssueSection
              title="Errors"
              icon="❌"
              items={errors}
              color="text-red-400"
              bgColor="bg-red-950/30"
            />
          )}

          {/* Warnings */}
          {warnings.filter((w) => w.field !== "duplicate").length > 0 && (
            <IssueSection
              title="Warnings"
              icon="⚠️"
              items={warnings.filter((w) => w.field !== "duplicate")}
              color="text-yellow-400"
              bgColor="bg-yellow-950/30"
            />
          )}

          {/* Duplicates */}
          {duplicates.length > 0 && (
            <div className="px-4 py-3 bg-orange-950/20">
              <p className="text-xs font-semibold text-orange-400 mb-2">
                🔁 {duplicates.length} possible duplicate{duplicates.length > 1 ? "s" : ""} detected
              </p>
              {duplicates.map((d, i) => (
                <DuplicateRow key={i} warning={d} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stat Pill ─────────────────────────────────────────────────────────────

function StatPill({
  count,
  label,
  color,
  dotColor,
}: {
  count: number;
  label: string;
  color: string;
  dotColor: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="font-semibold">{count}</span>
      <span className="text-gray-500">{label}</span>
    </span>
  );
}

// ─── Issue Section ─────────────────────────────────────────────────────────

function IssueSection({
  title,
  icon,
  items,
  color,
  bgColor,
}: {
  title: string;
  icon: string;
  items: ValidationError[];
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`px-4 py-3 ${bgColor}`}>
      <p className={`text-xs font-semibold ${color} mb-2`}>
        {icon} {title} ({items.length})
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-gray-400 flex gap-2">
            <span className={`font-mono ${color} shrink-0`}>[{item.field}]</span>
            <span>{item.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Duplicate Row ─────────────────────────────────────────────────────────

function DuplicateRow({ warning }: { warning: DuplicateWarning }) {
  return (
    <div className="text-xs text-gray-400 py-0.5">
      <span className="text-orange-400 font-mono mr-1.5">↩</span>
      {warning.reason}
    </div>
  );
}
