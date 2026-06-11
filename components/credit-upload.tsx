"use client";

import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedCredits } from "@/lib/handout-types";

interface CreditUploadProps {
  parsed: ParsedCredits | null;
  fileName: string | null;
  isLoading: boolean;
  error: string | null;
  onFileSelect: (file: File) => void;
}

export function CreditUpload({
  parsed,
  fileName,
  isLoading,
  error,
  onFileSelect,
}: CreditUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium uppercase tracking-wider text-cursor-text-muted">
        1. Upload codes
      </h2>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-cursor-border-emphasis bg-cursor-card p-8 transition-colors hover:border-cursor-orange/40 hover:bg-cursor-surface",
          isLoading && "pointer-events-none opacity-60"
        )}
      >
        <Upload className="h-8 w-8 text-cursor-text-faint" />
        <div className="text-center">
          <p className="text-sm font-medium text-cursor-text">
            Drop CSV or XLSX here
          </p>
          <p className="mt-1 text-xs text-cursor-text-muted">
            One referral URL or code per row · .csv, .txt, .xlsx
          </p>
        </div>
        <input
          type="file"
          accept=".csv,.txt,.xlsx,.xls"
          className="sr-only"
          onChange={handleChange}
          disabled={isLoading}
        />
      </label>

      {isLoading && (
        <p className="text-sm text-cursor-text-muted">Parsing file…</p>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {parsed && fileName && (
        <div className="rounded-md border border-cursor-border bg-cursor-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-cursor-text">
            <FileSpreadsheet className="h-4 w-4 text-cursor-orange" />
            {fileName}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cursor-accent-blue" />
            <span className="text-sm text-cursor-text">
              <strong className="text-cursor-orange">{parsed.urls.length}</strong>{" "}
              handouts ready
            </span>
          </div>
          {(parsed.duplicatesRemoved > 0 || parsed.invalidSkipped > 0) && (
            <p className="mt-2 text-xs text-cursor-text-faint">
              {parsed.duplicatesRemoved > 0 &&
                `${parsed.duplicatesRemoved} duplicate${parsed.duplicatesRemoved === 1 ? "" : "s"} removed`}
              {parsed.duplicatesRemoved > 0 && parsed.invalidSkipped > 0 && " · "}
              {parsed.invalidSkipped > 0 &&
                `${parsed.invalidSkipped} invalid row${parsed.invalidSkipped === 1 ? "" : "s"} skipped`}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
