"use client";

import { useState } from "react";
import type {
  ParsedEntry,
  ParsedTransaction,
  ParsedDebt,
  ParsedCommitment,
  ParsedPurchaseGoal,
  ValidationError,
} from "@/types/finance";
import CurrencyBadge from "./CurrencyBadge";
import ParsingConfidenceBadge from "./ParsingConfidenceBadge";

// ─── Categories ────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
  "Food & Groceries", "Dining Out", "Transport", "Accommodation",
  "Subscriptions", "Utilities", "Healthcare", "Shopping", "Health & Fitness",
  "Education", "Travel", "Family & Remittance", "Electronics", "Other",
];
const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Bonus", "Rental Income", "Investment", "Refund", "Other Income",
];
const CURRENCIES = ["AED", "INR", "USD", "EUR", "GBP"];

// ─── Type helpers ──────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  EXPENSE: { label: "Expense", icon: "↑", color: "text-red-400" },
  INCOME: { label: "Income", icon: "↓", color: "text-emerald-400" },
  DEBT: { label: "Debt", icon: "⚠", color: "text-orange-400" },
  COMMITMENT: { label: "Commitment", icon: "📅", color: "text-blue-400" },
  PURCHASE_GOAL: { label: "Goal", icon: "🎯", color: "text-purple-400" },
};

// ─── Props ─────────────────────────────────────────────────────────────────

interface ParsedTransactionTableProps {
  entries: ParsedEntry[];
  errors: ValidationError[];
  duplicateIds: Set<string>;
  onUpdate: (updated: ParsedEntry) => void;
  onDelete: (id: string) => void;
  onSkipDuplicate: (id: string) => void;
}

// ─── Editable Row ──────────────────────────────────────────────────────────

interface EditableRowProps {
  entry: ParsedEntry;
  rowNumber: number;
  hasError: boolean;
  isDuplicate: boolean;
  onUpdate: (updated: ParsedEntry) => void;
  onDelete: (id: string) => void;
  onSkip: (id: string) => void;
}

function EditableRow({
  entry,
  rowNumber,
  hasError,
  isDuplicate,
  onUpdate,
  onDelete,
  onSkip,
}: EditableRowProps) {
  const [editing, setEditing] = useState(false);

  const meta = TYPE_LABELS[entry.type] ?? TYPE_LABELS.EXPENSE;

  // ── Field accessors by type ──
  const getTitle = () => {
    if (entry.type === "EXPENSE" || entry.type === "INCOME")
      return (entry as ParsedTransaction).title;
    if (entry.type === "DEBT") return (entry as ParsedDebt).debtName;
    if (entry.type === "COMMITMENT") return (entry as ParsedCommitment).title;
    return (entry as ParsedPurchaseGoal).itemName;
  };

  const getAmount = () => {
    if (entry.type === "EXPENSE" || entry.type === "INCOME")
      return (entry as ParsedTransaction).amount;
    if (entry.type === "DEBT") return (entry as ParsedDebt).totalAmount;
    if (entry.type === "COMMITMENT") return (entry as ParsedCommitment).amount;
    return (entry as ParsedPurchaseGoal).estimatedCost;
  };

  const getCurrency = () => {
    if (entry.type === "EXPENSE" || entry.type === "INCOME")
      return (entry as ParsedTransaction).currency;
    if (entry.type === "DEBT") return (entry as ParsedDebt).currency;
    if (entry.type === "COMMITMENT") return (entry as ParsedCommitment).currency;
    return (entry as ParsedPurchaseGoal).currency;
  };

  const getCategory = () => {
    if (entry.type === "EXPENSE" || entry.type === "INCOME")
      return (entry as ParsedTransaction).category;
    return "";
  };

  const getDate = () => {
    if (entry.type === "EXPENSE" || entry.type === "INCOME")
      return (entry as ParsedTransaction).transactionDate;
    if (entry.type === "COMMITMENT") return (entry as ParsedCommitment).dueDate;
    return "";
  };

  // ── Inline field update ──
  function setTitle(val: string) {
    if (entry.type === "EXPENSE" || entry.type === "INCOME")
      onUpdate({ ...(entry as ParsedTransaction), title: val });
    else if (entry.type === "DEBT")
      onUpdate({ ...(entry as ParsedDebt), debtName: val });
    else if (entry.type === "COMMITMENT")
      onUpdate({ ...(entry as ParsedCommitment), title: val });
    else onUpdate({ ...(entry as ParsedPurchaseGoal), itemName: val });
  }

  function setAmount(val: number) {
    if (entry.type === "EXPENSE" || entry.type === "INCOME")
      onUpdate({ ...(entry as ParsedTransaction), amount: val });
    else if (entry.type === "DEBT")
      onUpdate({ ...(entry as ParsedDebt), totalAmount: val });
    else if (entry.type === "COMMITMENT")
      onUpdate({ ...(entry as ParsedCommitment), amount: val });
    else onUpdate({ ...(entry as ParsedPurchaseGoal), estimatedCost: val });
  }

  function setCurrency(val: string) {
    if (entry.type === "EXPENSE" || entry.type === "INCOME")
      onUpdate({ ...(entry as ParsedTransaction), currency: val });
    else if (entry.type === "DEBT")
      onUpdate({ ...(entry as ParsedDebt), currency: val });
    else if (entry.type === "COMMITMENT")
      onUpdate({ ...(entry as ParsedCommitment), currency: val });
    else onUpdate({ ...(entry as ParsedPurchaseGoal), currency: val });
  }

  function setCategory(val: string) {
    if (entry.type === "EXPENSE" || entry.type === "INCOME")
      onUpdate({ ...(entry as ParsedTransaction), category: val });
  }

  function setDate(val: string) {
    if (entry.type === "EXPENSE" || entry.type === "INCOME")
      onUpdate({ ...(entry as ParsedTransaction), transactionDate: val });
    else if (entry.type === "COMMITMENT")
      onUpdate({ ...(entry as ParsedCommitment), dueDate: val });
  }

  const rowBg = hasError
    ? "bg-red-950/30 border-l-2 border-l-red-500"
    : isDuplicate
    ? "bg-yellow-950/30 border-l-2 border-l-yellow-500"
    : "bg-gray-800/50 border-l-2 border-l-transparent";

  const inputCls =
    "bg-transparent border-b border-gray-600 focus:border-purple-500 outline-none text-gray-100 text-sm w-full px-1 py-0.5";

  return (
    <tr className={`${rowBg} hover:bg-gray-700/40 transition-colors`}>
      {/* # */}
      <td className="px-3 py-2.5 text-gray-500 text-xs w-8 text-center">
        {rowNumber}
      </td>

      {/* Type */}
      <td className="px-2 py-2.5 w-24">
        <span className={`text-xs font-medium ${meta.color}`}>
          {meta.icon} {meta.label}
        </span>
      </td>

      {/* Title */}
      <td className="px-2 py-2.5 min-w-[140px]">
        {editing ? (
          <input
            className={inputCls}
            value={getTitle()}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <span className="text-sm text-gray-100 truncate block max-w-[200px]">
            {getTitle()}
          </span>
        )}
      </td>

      {/* Amount */}
      <td className="px-2 py-2.5 w-24">
        {editing ? (
          <input
            type="number"
            className={inputCls}
            value={getAmount()}
            min={0}
            step="0.01"
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
        ) : (
          <span className="text-sm text-gray-100 font-mono">
            {getAmount().toLocaleString()}
          </span>
        )}
      </td>

      {/* Currency */}
      <td className="px-2 py-2.5 w-20">
        {editing ? (
          <select
            className="bg-gray-700 border border-gray-600 rounded text-gray-100 text-xs px-1 py-1 outline-none"
            value={getCurrency()}
            onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        ) : (
          <CurrencyBadge currency={getCurrency()} />
        )}
      </td>

      {/* Category (only for EXPENSE/INCOME) */}
      <td className="px-2 py-2.5 min-w-[120px]">
        {(entry.type === "EXPENSE" || entry.type === "INCOME") ? (
          editing ? (
            <select
              className="bg-gray-700 border border-gray-600 rounded text-gray-100 text-xs px-1 py-1 outline-none w-full"
              value={getCategory()}
              onChange={(e) => setCategory(e.target.value)}>
              {(entry.type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-gray-400">{getCategory()}</span>
          )
        ) : (
          <span className="text-xs text-gray-600">—</span>
        )}
      </td>

      {/* Date */}
      <td className="px-2 py-2.5 w-28">
        {(entry.type === "EXPENSE" || entry.type === "INCOME" || entry.type === "COMMITMENT") ? (
          editing ? (
            <input
              type="date"
              className="bg-gray-700 border border-gray-600 rounded text-gray-100 text-xs px-1 py-1 outline-none"
              value={getDate()}
              onChange={(e) => setDate(e.target.value)}
            />
          ) : (
            <span className="text-xs text-gray-400 font-mono">{getDate()}</span>
          )
        ) : (
          <span className="text-xs text-gray-600">—</span>
        )}
      </td>

      {/* Confidence */}
      <td className="px-2 py-2.5 w-16 text-center">
        <ParsingConfidenceBadge score={entry.confidenceScore} />
      </td>

      {/* Actions */}
      <td className="px-2 py-2.5 w-20">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing((v) => !v)}
            title={editing ? "Done" : "Edit"}
            className="p-1 rounded text-gray-400 hover:text-purple-400 hover:bg-gray-700 transition-colors">
            {editing ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </button>

          {isDuplicate && (
            <button
              onClick={() => onSkip(entry.id)}
              title="Skip duplicate"
              className="p-1 rounded text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <button
            onClick={() => onDelete(entry.id)}
            title="Remove"
            className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Table ────────────────────────────────────────────────────────────

export default function ParsedTransactionTable({
  entries,
  errors,
  duplicateIds,
  onUpdate,
  onDelete,
  onSkipDuplicate,
}: ParsedTransactionTableProps) {
  if (entries.length === 0) return null;

  const errorEntryIds = new Set(
    errors.filter((e) => e.severity === "error").map((e) => e.entryId)
  );

  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/80 border-b border-gray-700">
              <th className="px-3 py-2.5 text-xs text-gray-500 font-medium w-8">#</th>
              <th className="px-2 py-2.5 text-xs text-gray-500 font-medium">Type</th>
              <th className="px-2 py-2.5 text-xs text-gray-500 font-medium">Title</th>
              <th className="px-2 py-2.5 text-xs text-gray-500 font-medium">Amount</th>
              <th className="px-2 py-2.5 text-xs text-gray-500 font-medium">Currency</th>
              <th className="px-2 py-2.5 text-xs text-gray-500 font-medium">Category</th>
              <th className="px-2 py-2.5 text-xs text-gray-500 font-medium">Date</th>
              <th className="px-2 py-2.5 text-xs text-gray-500 font-medium text-center">Conf.</th>
              <th className="px-2 py-2.5 text-xs text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {entries.map((entry, i) => (
              <EditableRow
                key={entry.id}
                entry={entry}
                rowNumber={i + 1}
                hasError={errorEntryIds.has(entry.id)}
                isDuplicate={duplicateIds.has(entry.id)}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onSkip={onSkipDuplicate}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-800/60 border-t border-gray-700 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {entries.length} entr{entries.length === 1 ? "y" : "ies"} detected
        </span>
        <span className="text-xs text-gray-500">
          Click ✏ to edit inline · Shift+Enter for new line
        </span>
      </div>
    </div>
  );
}
