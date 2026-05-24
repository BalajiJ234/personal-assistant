"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import FinanceChatInput from "@/components/finance/FinanceChatInput";
import ValidationSummary from "@/components/finance/ValidationSummary";
import DuplicateWarningCard from "@/components/finance/DuplicateWarningCard";
import ParsedTransactionTable from "@/components/finance/ParsedTransactionTable";
import ImportPreviewModal from "@/components/finance/ImportPreviewModal";
import ImportHistoryPanel from "@/components/finance/ImportHistoryPanel";
import {
  parseMessage,
  parseFile,
  confirmImport,
  getImportHistory,
} from "@/lib/financeApi";
import type {
  ParsedEntry,
  ValidationSummary as ValidationSummaryType,
  ConfirmImportResponse,
  ImportHistoryRecord,
  ImportStage,
} from "@/types/finance";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ImportResult {
  response: ConfirmImportResponse;
  entryCount: number;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function FinanceImportPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<ImportStage>("idle");
  const [entries, setEntries] = useState<ParsedEntry[]>([]);
  const [validation, setValidation] = useState<ValidationSummaryType | null>(null);
  const [unparsedLines, setUnparsedLines] = useState<string[]>([]);
  const [sourceType, setSourceType] = useState<"chat" | "file">("chat");
  const [fileName, setFileName] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [history, setHistory] = useState<ImportHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Derived: entry ids to skip (marked as duplicate)
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  // ── Load history on mount ────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getImportHistory();
      setHistory(res.history);
    } catch {
      // history is non-critical, fail silently
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ── Parse from chat message ──────────────────────────────────────────────
  const handleSendMessage = async (message: string) => {
    setStage("parsing");
    setErrorMessage("");
    setSkippedIds(new Set());
    try {
      const res = await parseMessage(message);
      setEntries(res.entries);
      setValidation(res.validation);
      setUnparsedLines(res.unparsedLines);
      setSourceType("chat");
      setFileName(undefined);
      setStage("preview");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to parse message");
      setStage("error");
    }
  };

  // ── Parse from file upload ───────────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    setStage("parsing");
    setErrorMessage("");
    setSkippedIds(new Set());
    try {
      const res = await parseFile(file);
      setEntries(res.entries);
      setValidation(res.validation);
      setUnparsedLines(res.unparsedLines ?? []);
      setSourceType("file");
      setFileName(res.fileName ?? file.name);
      setStage("preview");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to parse file");
      setStage("error");
    }
  };

  // ── Entry mutations from table ───────────────────────────────────────────
  const handleUpdateEntry = useCallback((updated: ParsedEntry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  }, []);

  const handleDeleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSkippedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }, []);

  const handleSkipDuplicate = useCallback((id: string) => {
    setSkippedIds((prev) => new Set([...prev, id]));
  }, []);

  const handleSkipAllDuplicates = () => {
    if (!validation) return;
    const ids = new Set(validation.duplicates.map((d) => d.entryId));
    setSkippedIds(ids);
  };

  // ── Open confirm modal ───────────────────────────────────────────────────
  const handleOpenConfirm = () => {
    setShowConfirmModal(true);
    setStage("confirming");
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setStage("preview");
  };

  // ── Confirm import ───────────────────────────────────────────────────────
  const handleConfirmImport = async () => {
    const toImport = entries.filter((e) => !skippedIds.has(e.id));
    setStage("importing");
    try {
      const res = await confirmImport(toImport, sourceType, fileName);
      setImportResult({ response: res, entryCount: toImport.length });
      setShowConfirmModal(false);
      setStage("success");
      await fetchHistory();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Import failed");
      setShowConfirmModal(false);
      setStage("error");
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStage("idle");
    setEntries([]);
    setValidation(null);
    setUnparsedLines([]);
    setSkippedIds(new Set());
    setFileName(undefined);
    setImportResult(null);
    setErrorMessage("");
    setShowConfirmModal(false);
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const visibleEntries = entries.filter((e) => !skippedIds.has(e.id));
  const duplicateCount = validation?.duplicates.filter(
    (d) => !skippedIds.has(d.entryId)
  ).length ?? 0;
  const errorIds = new Set(
    validation?.errors
      .filter((e) => e.severity === "error")
      .map((e) => e.entryId) ?? []
  );
  const canConfirm =
    visibleEntries.length > 0 &&
    (validation?.invalid ?? 0) === 0;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-100">Finance Import</h1>
            <p className="text-xs text-gray-500">Paste text or upload a file to parse transactions</p>
          </div>
          {/* History toggle */}
          <button
            onClick={() => setShowHistory((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              showHistory
                ? "bg-gray-700 text-gray-200"
                : "text-gray-500 hover:bg-gray-800 hover:text-gray-200"
            }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
            {history.length > 0 && (
              <span className="bg-purple-600 text-white rounded-full px-1.5 text-[10px]">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-4">

        {/* ── Success Banner ─────────────────────────────────────────────── */}
        {stage === "success" && importResult && (
          <SuccessBanner result={importResult} onReset={handleReset} />
        )}

        {/* ── Error Banner ───────────────────────────────────────────────── */}
        {stage === "error" && (
          <div className="bg-red-950/40 border border-red-700/50 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-300">{errorMessage || "Something went wrong"}</p>
            </div>
            <button
              onClick={handleReset}
              className="shrink-0 text-xs text-red-400 hover:text-red-200 underline">
              Try again
            </button>
          </div>
        )}

        {/* ── History Panel ──────────────────────────────────────────────── */}
        {showHistory && (
          <ImportHistoryPanel records={history} isLoading={historyLoading} />
        )}

        {/* ── Input Section ──────────────────────────────────────────────── */}
        {(stage === "idle" || stage === "error") && (
          <section className="space-y-3">
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
              <h2 className="text-sm font-medium text-gray-300">Paste transactions or upload a file</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Try: <span className="text-purple-400">
                  &quot;paid 150 AED for groceries, received salary 8000 AED, coffee 12 AED&quot;
                </span> — or upload a CSV / JSON / TXT file.
              </p>
            </div>
            <FinanceChatInput
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              isLoading={false}
              placeholder='e.g. "coffee 12 AED, lunch 35 AED, rent 4500 AED next month…"'
            />
          </section>
        )}

        {/* ── Parsing Spinner ────────────────────────────────────────────── */}
        {stage === "parsing" && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <svg className="w-8 h-8 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm text-gray-400">Parsing your transactions…</p>
          </div>
        )}

        {/* ── Preview Stage ──────────────────────────────────────────────── */}
        {(stage === "preview" || stage === "confirming") && (
          <>
            {/* Source info + reset */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{sourceType === "file" ? "📄" : "💬"}</span>
                <span className="text-sm text-gray-400">
                  {sourceType === "file" && fileName ? (
                    <><span className="text-gray-200 font-medium">{fileName}</span> · </>
                  ) : (
                    "Chat message · "
                  )}
                  <span className="text-purple-400 font-medium">{entries.length}</span>{" "}
                  entr{entries.length === 1 ? "y" : "ies"} detected
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors">
                Start over
              </button>
            </div>

            {/* Validation summary */}
            {validation && <ValidationSummary summary={validation} />}

            {/* Duplicate warning */}
            {duplicateCount > 0 && (
              <DuplicateWarningCard
                count={duplicateCount}
                onSkipAll={handleSkipAllDuplicates}
                onImportAnyway={() => setSkippedIds(new Set())}
              />
            )}

            {/* Unparsed lines warning */}
            {unparsedLines.length > 0 && (
              <details className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                <summary className="px-4 py-2.5 text-xs text-yellow-400 cursor-pointer hover:bg-gray-800 transition-colors">
                  ⚠ {unparsedLines.length} line{unparsedLines.length > 1 ? "s" : ""} could not be parsed
                </summary>
                <ul className="px-4 pb-3 space-y-1">
                  {unparsedLines.map((line, i) => (
                    <li key={i} className="text-xs text-gray-500 font-mono bg-gray-900/50 rounded px-2 py-1">
                      {line}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* Table */}
            <ParsedTransactionTable
              entries={visibleEntries}
              errors={validation?.errors ?? []}
              duplicateIds={skippedIds}
              onUpdate={handleUpdateEntry}
              onDelete={handleDeleteEntry}
              onSkipDuplicate={handleSkipDuplicate}
            />

            {/* Confirm bar */}
            <div className="sticky bottom-4 flex items-center justify-between gap-4 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-2xl">
              <p className="text-xs text-gray-400">
                {visibleEntries.length} entr{visibleEntries.length === 1 ? "y" : "ies"} ready
                {skippedIds.size > 0 && (
                  <span className="text-gray-500 ml-1">
                    · {skippedIds.size} skipped
                  </span>
                )}
              </p>
              <button
                onClick={handleOpenConfirm}
                disabled={!canConfirm}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Import to WealthPulse
              </button>
            </div>
          </>
        )}

        {/* ── Success: new import button ──────────────────────────────────── */}
        {stage === "success" && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 rounded-xl text-sm font-medium transition-colors">
              Import more transactions
            </button>
          </div>
        )}
      </main>

      {/* ── Confirm Modal ──────────────────────────────────────────────────── */}
      {showConfirmModal && (
        <ImportPreviewModal
          entries={visibleEntries}
          isLoading={stage === "importing"}
          onConfirm={handleConfirmImport}
          onCancel={handleCancelConfirm}
        />
      )}
    </div>
  );
}

// ─── Success Banner ──────────────────────────────────────────────────────────

function SuccessBanner({
  result,
  onReset,
}: {
  result: ImportResult;
  onReset: () => void;
}) {
  const { response } = result;
  const total =
    response.importedTransactions +
    response.importedDebts +
    response.importedCommitments;

  return (
    <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl px-4 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm font-medium text-emerald-300">
          Import complete — {total} record{total !== 1 ? "s" : ""} saved
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {response.importedTransactions > 0 && (
          <Chip label="Transactions" count={response.importedTransactions} color="text-emerald-400" />
        )}
        {response.importedDebts > 0 && (
          <Chip label="Debts" count={response.importedDebts} color="text-orange-400" />
        )}
        {response.importedCommitments > 0 && (
          <Chip label="Commitments" count={response.importedCommitments} color="text-blue-400" />
        )}
        {response.skipped > 0 && (
          <Chip label="Skipped" count={response.skipped} color="text-gray-400" />
        )}
      </div>

      {response.errors.length > 0 && (
        <div className="text-xs text-red-400 space-y-0.5">
          {response.errors.map((e, i) => (
            <p key={i}>⚠ {e}</p>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <a
          href="http://localhost:3006/life-sync/wealth/transactions"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-400 hover:text-purple-300 underline">
          View in WealthPulse →
        </a>
        <button onClick={onReset} className="text-xs text-gray-500 hover:text-gray-300 underline">
          Import more
        </button>
      </div>
    </div>
  );
}

function Chip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span className="flex items-center gap-1 bg-gray-800/70 rounded-lg px-2.5 py-1 text-xs">
      <span className={`font-semibold ${color}`}>{count}</span>
      <span className="text-gray-400">{label}</span>
    </span>
  );
}
