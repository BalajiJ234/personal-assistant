"use client";

import { useState, useRef, DragEvent, ChangeEvent, KeyboardEvent } from "react";

const ALLOWED_EXTENSIONS = [".csv", ".json", ".txt"];
const MAX_FILE_SIZE_MB = 5;

interface FinanceChatInputProps {
  onSendMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  /** Placeholder examples to cycle through */
  placeholder?: string;
}

export default function FinanceChatInput({
  onSendMessage,
  onFileUpload,
  isLoading,
  placeholder = 'Try: "Paid 120 AED grocery, 45 AED taxi, salary received 8500 AED"',
}: FinanceChatInputProps) {
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auto-grow textarea ──────────────────────────────────────────────────
  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }

  // ── Send text ────────────────────────────────────────────────────────────
  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── File validation ──────────────────────────────────────────────────────
  function validateFile(file: File): string | null {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type "${ext}". Use CSV, JSON, or TXT.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large (max ${MAX_FILE_SIZE_MB} MB).`;
    }
    return null;
  }

  function processFile(file: File) {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError(null);
    onFileUpload(file);
  }

  // ── Drag & drop ──────────────────────────────────────────────────────────
  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  // ── File picker ──────────────────────────────────────────────────────────
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = ""; // allow re-selecting same file
  }

  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <div className="space-y-3">
      {/* ── Drag-drop overlay + main input card ── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border transition-colors ${
          isDragging
            ? "border-purple-500 bg-purple-900/20"
            : "border-gray-700 bg-gray-800"
        }`}>
        {isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-purple-900/40 z-10 pointer-events-none">
            <svg
              className="w-10 h-10 text-purple-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-purple-300 font-medium">Drop file to parse</span>
            <span className="text-purple-400/70 text-sm mt-1">CSV · JSON · TXT</span>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoGrow();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={3}
          className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none px-4 pt-4 pb-2 text-sm leading-relaxed min-h-[80px]"
          style={{ maxHeight: "220px" }}
        />

        {/* Bottom bar: actions */}
        <div className="flex items-center justify-between px-3 pb-3 gap-2">
          <div className="flex items-center gap-2">
            {/* File upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Upload CSV / JSON / TXT"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span>Upload file</span>
            </button>
            <span className="text-gray-600 text-xs">CSV · JSON · TXT · drag &amp; drop</span>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              canSend
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}>
            {isLoading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Parsing…
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Parse
              </>
            )}
          </button>
        </div>
      </div>

      {/* File error */}
      {fileError && (
        <p className="text-red-400 text-xs px-1">{fileError}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
