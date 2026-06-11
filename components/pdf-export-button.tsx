"use client";

import { Download, Loader2, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExportProgress } from "@/lib/pdf-export";

interface PdfExportButtonProps {
  handoutCount: number;
  disabled: boolean;
  isExporting: boolean;
  progress: ExportProgress | null;
  onExportPdf: () => void;
  onPrintFallback: () => void;
}

export function PdfExportButton({
  handoutCount,
  disabled,
  isExporting,
  progress,
  onExportPdf,
  onPrintFallback,
}: PdfExportButtonProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium uppercase tracking-wider text-cursor-text-muted">
        4. Export
      </h2>
      <div className="space-y-3 rounded-md border border-cursor-border bg-cursor-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cursor-text">
            {handoutCount > 0
              ? `${handoutCount} handout${handoutCount === 1 ? "" : "s"} ready`
              : "Upload codes to generate handouts"}
          </p>
          {handoutCount > 200 && (
            <p className="mt-1 text-xs text-cursor-text-faint">
              Large export — may take a minute. Use print fallback if PDF fails.
            </p>
          )}
        </div>
      </div>

      {progress && isExporting && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-cursor-text-muted">
            <span>{progress.message}</span>
            {progress.total > 0 && (
              <span>
                {progress.current}/{progress.total}
              </span>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-cursor-surface">
            <div
              className="h-full bg-cursor-orange transition-all duration-300"
              style={{
                width:
                  progress.total > 0
                    ? `${Math.round((progress.current / progress.total) * 100)}%`
                    : "30%",
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={disabled || isExporting}
          onClick={onExportPdf}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
            disabled || isExporting
              ? "cursor-not-allowed bg-cursor-surface text-cursor-text-faint"
              : "bg-cursor-orange text-white hover:bg-cursor-orange-hover"
          )}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {handoutCount > 0
            ? `Download ${handoutCount}-page PDF`
            : "Download PDF"}
        </button>

        <button
          type="button"
          disabled={disabled || isExporting}
          onClick={onPrintFallback}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
            disabled || isExporting
              ? "cursor-not-allowed border-cursor-border text-cursor-text-faint"
              : "border-cursor-border-emphasis bg-cursor-surface text-cursor-text hover:border-cursor-orange/30"
          )}
        >
          <Printer className="h-4 w-4" />
          Print view
        </button>
      </div>
      </div>
    </div>
  );
}
