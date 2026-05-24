/**
 * Finance import types for the personal-assistant frontend.
 * Mirror of the parsed output shapes from personal-assistant-api.
 */

// ─── Parsed Entry Variants ──────────────────────────────────────────────────

export interface ParsedTransaction {
  id: string;
  type: "EXPENSE" | "INCOME";
  title: string;
  amount: number;
  currency: string;
  category: string;
  transactionDate: string;
  confidenceScore: number;
  source: "chat" | "file";
  tags: string[];
  notes: string;
  rawText: string;
}

export interface ParsedDebt {
  id: string;
  type: "DEBT";
  debtName: string;
  totalAmount: number;
  currency: string;
  debtType: string;
  status: "ACTIVE";
  confidenceScore: number;
  rawText: string;
}

export interface ParsedCommitment {
  id: string;
  type: "COMMITMENT";
  title: string;
  amount: number;
  currency: string;
  dueDate: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  confidenceScore: number;
  rawText: string;
}

export interface ParsedPurchaseGoal {
  id: string;
  type: "PURCHASE_GOAL";
  itemName: string;
  estimatedCost: number;
  currency: string;
  targetDate: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  confidenceScore: number;
  rawText: string;
}

export type ParsedEntry =
  | ParsedTransaction
  | ParsedDebt
  | ParsedCommitment
  | ParsedPurchaseGoal;

// ─── Validation ────────────────────────────────────────────────────────────

export interface ValidationError {
  entryId: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface DuplicateWarning {
  entryId: string;
  duplicateOf: string;
  reason: string;
}

export interface ValidationSummary {
  valid: number;
  invalid: number;
  needsReview: number;
  ignored: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  duplicates: DuplicateWarning[];
}

// ─── Parse API Response ────────────────────────────────────────────────────

export interface ParseResponse {
  entries: ParsedEntry[];
  unparsedLines: string[];
  totalDetected: number;
  validation: ValidationSummary;
  /** Only present in parse-file response */
  fileName?: string;
}

// ─── Validate API Response ─────────────────────────────────────────────────

export interface ValidateResponse extends ValidationSummary {
  validEntries: ParsedEntry[];
  invalidEntries: ParsedEntry[];
  needsReviewEntries: ParsedEntry[];
}

// ─── Confirm Import API Response ───────────────────────────────────────────

export interface ConfirmImportResponse {
  success: boolean;
  importedTransactions: number;
  importedDebts: number;
  importedCommitments: number;
  skipped: number;
  errors: string[];
  historyId: string;
}

// ─── Import History ────────────────────────────────────────────────────────

export interface ImportHistoryRecord {
  id: string;
  sourceType: "chat" | "file";
  fileName?: string;
  importedCount: number;
  skippedCount: number;
  duplicateCount: number;
  createdAt: string;
}

export interface ImportHistoryResponse {
  history: ImportHistoryRecord[];
}

// ─── UI State ──────────────────────────────────────────────────────────────

/** The stage of the finance import workflow */
export type ImportStage =
  | "idle"        // nothing parsed yet
  | "parsing"     // request in-flight
  | "preview"     // showing parsed preview table
  | "confirming"  // confirm modal open
  | "importing"   // confirm-import in-flight
  | "success"     // import done
  | "error";      // unrecoverable error

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  /** base64 or object URL for display purposes only */
  preview?: string;
}
