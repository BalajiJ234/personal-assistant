"use client";

import { useEffect } from "react";
import type { ParsedEntry, ParsedTransaction, ParsedDebt, ParsedCommitment } from "@/types/finance";
import CurrencyBadge from "./CurrencyBadge";

interface ImportPreviewModalProps {
  entries: ParsedEntry[];
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ImportPreviewModal({
  entries,
  isLoading,
  onConfirm,
  onCancel,
}: ImportPreviewModalProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const expenses = entries.filter((e) => e.type === "EXPENSE") as ParsedTransaction[];
  const incomes = entries.filter((e) => e.type === "INCOME") as ParsedTransaction[];
  const debts = entries.filter((e) => e.type === "DEBT") as ParsedDebt[];
  const commitments = entries.filter((e) => e.type === "COMMITMENT") as ParsedCommitment[];
  const goals = entries.filter((e) => e.type === "PURCHASE_GOAL");

  // Group totals by currency for expenses
  const expenseTotals: Record<string, number> = {};
  for (const e of expenses) {
    expenseTotals[e.currency] = (expenseTotals[e.currency] ?? 0) + e.amount;
  }
  const incomeTotals: Record<string, number> = {};
  for (const e of incomes) {
    incomeTotals[e.currency] = (incomeTotals[e.currency] ?? 0) + e.amount;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg mx-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-100">Confirm Import</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {entries.length} entr{entries.length === 1 ? "y" : "ies"} will be saved to WealthPulse
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary */}
        <div className="px-5 py-4 space-y-3">
          {/* Type counts */}
          <div className="grid grid-cols-2 gap-2">
            {expenses.length > 0 && (
              <SummaryCard
                icon="↑"
                label="Expenses"
                count={expenses.length}
                totals={expenseTotals}
                iconColor="text-red-400"
                borderColor="border-red-800/50"
              />
            )}
            {incomes.length > 0 && (
              <SummaryCard
                icon="↓"
                label="Income"
                count={incomes.length}
                totals={incomeTotals}
                iconColor="text-emerald-400"
                borderColor="border-emerald-800/50"
              />
            )}
            {debts.length > 0 && (
              <SummaryCard
                icon="⚠"
                label="Debts"
                count={debts.length}
                totals={{}}
                iconColor="text-orange-400"
                borderColor="border-orange-800/50"
              />
            )}
            {commitments.length > 0 && (
              <SummaryCard
                icon="📅"
                label="Commitments"
                count={commitments.length}
                totals={{}}
                iconColor="text-blue-400"
                borderColor="border-blue-800/50"
              />
            )}
            {goals.length > 0 && (
              <div className="col-span-2 bg-gray-800/50 border border-purple-800/40 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400">
                  🎯 <span className="text-purple-400 font-medium">{goals.length}</span> Purchase Goal{goals.length > 1 ? "s" : ""} — saved as suggestions only
                </p>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 bg-yellow-950/30 border border-yellow-800/40 rounded-lg px-3 py-2.5">
            <span className="text-yellow-400 text-sm mt-0.5">ℹ</span>
            <p className="text-xs text-yellow-300/80">
              This will write directly to your WealthPulse database. This action cannot be undone from here.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-700">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || entries.length === 0}
            className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Importing…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Summary Card ──────────────────────────────────────────────────────────

function SummaryCard({
  icon,
  label,
  count,
  totals,
  iconColor,
  borderColor,
}: {
  icon: string;
  label: string;
  count: number;
  totals: Record<string, number>;
  iconColor: string;
  borderColor: string;
}) {
  const hasTotals = Object.keys(totals).length > 0;

  return (
    <div className={`bg-gray-800/50 border ${borderColor} rounded-lg px-3 py-2.5`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`text-sm font-bold ${iconColor}`}>{icon}</span>
        <span className="text-xs font-medium text-gray-300">{label}</span>
        <span className="ml-auto text-xs font-semibold text-gray-100">{count}</span>
      </div>
      {hasTotals && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {Object.entries(totals).map(([currency, total]) => (
            <span key={currency} className="flex items-center gap-1 text-xs text-gray-400">
              <CurrencyBadge currency={currency} showFlag={false} />
              {total.toLocaleString()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
