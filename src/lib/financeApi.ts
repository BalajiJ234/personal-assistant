/**
 * Finance API client for personal-assistant frontend.
 * Talks exclusively to personal-assistant-api at /api/finance/*.
 */

import type {
  ParseResponse,
  ValidateResponse,
  ConfirmImportResponse,
  ImportHistoryResponse,
  ParsedEntry,
} from "@/types/finance";

const BASE_URL =
  process.env.NEXT_PUBLIC_ASSISTANT_API_URL ?? "http://localhost:3003";

// ─── Helpers ───────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ─── Parse a chat message ──────────────────────────────────────────────────

export async function parseMessage(message: string): Promise<ParseResponse> {
  const res = await fetch(`${BASE_URL}/api/finance/parse-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return handleResponse<ParseResponse>(res);
}

// ─── Parse an uploaded file ────────────────────────────────────────────────

export async function parseFile(file: File): Promise<ParseResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/api/finance/parse-file`, {
    method: "POST",
    body: form,
    // Do NOT set Content-Type — browser sets multipart boundary automatically
  });
  return handleResponse<ParseResponse>(res);
}

// ─── Re-validate edited preview ───────────────────────────────────────────

export async function validateEntries(
  entries: ParsedEntry[]
): Promise<ValidateResponse> {
  const res = await fetch(`${BASE_URL}/api/finance/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });
  return handleResponse<ValidateResponse>(res);
}

// ─── Confirm import ────────────────────────────────────────────────────────

export async function confirmImport(
  entries: ParsedEntry[],
  sourceType: "chat" | "file" = "chat",
  fileName?: string
): Promise<ConfirmImportResponse> {
  const res = await fetch(`${BASE_URL}/api/finance/confirm-import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries, sourceType, fileName }),
  });
  return handleResponse<ConfirmImportResponse>(res);
}

// ─── Fetch import history ──────────────────────────────────────────────────

export async function getImportHistory(): Promise<ImportHistoryResponse> {
  const res = await fetch(`${BASE_URL}/api/finance/import-history`);
  return handleResponse<ImportHistoryResponse>(res);
}
