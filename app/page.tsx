"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { CreditUpload } from "@/components/credit-upload";
import { HandoutForm } from "@/components/handout-form";
import { HandoutSectionEditor } from "@/components/handout-section-editor";
import { HandoutLivePanel } from "@/components/handout-preview";
import { PdfExportButton } from "@/components/pdf-export-button";
import {
  DEFAULT_LOGO_SRC,
  type ParsedCredits,
} from "@/lib/handout-types";
import { parseCreditFile } from "@/lib/parse-credits";
import {
  exportHandoutsPdf,
  usePrintFallback,
  type ExportProgress,
} from "@/lib/pdf-export";
import { useHandoutConfig } from "@/lib/use-handout-config";

const DEFAULT_LOGO = DEFAULT_LOGO_SRC;

export default function HomePage() {
  const { config, setConfig, resetConfig } = useHandoutConfig();
  const [parsed, setParsed] = useState<ParsedCredits | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(
    null
  );

  const { openPrintView } = usePrintFallback();

  const firstCreditUrl = parsed?.urls[0] ?? null;
  const handoutCount = parsed?.urls.length ?? 0;

  const handleFileSelect = useCallback(async (file: File) => {
    setParseLoading(true);
    setParseError(null);
    setFileName(file.name);
    try {
      const result = await parseCreditFile(file);
      if (result.urls.length === 0) {
        setParseError("No valid credit codes found in this file.");
        setParsed(null);
      } else {
        setParsed(result);
      }
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Failed to parse file");
      setParsed(null);
    } finally {
      setParseLoading(false);
    }
  }, []);

  const handleExportPdf = useCallback(async () => {
    if (!parsed?.urls.length) return;
    setIsExporting(true);
    setExportProgress({
      phase: "generating",
      current: 0,
      total: parsed.urls.length,
      message: "Starting…",
    });
    try {
      await exportHandoutsPdf(
        config,
        parsed.urls,
        DEFAULT_LOGO,
        setExportProgress
      );
    } catch (e) {
      setExportProgress({
        phase: "error",
        current: 0,
        total: parsed.urls.length,
        message: e instanceof Error ? e.message : "PDF export failed",
      });
    } finally {
      setIsExporting(false);
    }
  }, [config, parsed]);

  const handlePrintFallback = useCallback(async () => {
    if (!parsed?.urls.length) return;
    setIsExporting(true);
    try {
      await openPrintView(config, parsed.urls, DEFAULT_LOGO);
    } finally {
      setIsExporting(false);
    }
  }, [config, parsed, openPrintView]);

  const heroSubtitle = useMemo(
    () =>
      "Upload credit codes, customize your event, and download a print-ready PDF — one unique handout per attendee. Everything runs in your browser; codes never leave your device.",
    []
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-cursor-border bg-cursor-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-3">
            <Image
              src="/cursor-logo.svg"
              alt="Cursor"
              width={100}
              height={24}
              className="h-6 w-auto"
              priority
            />
            <span className="text-sm font-semibold tracking-tight text-cursor-text">
              Event Credit Handouts
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-8 text-center md:mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-cursor-text md:text-3xl">
            Print handouts for your meetup
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-cursor-text-muted">
            {heroSubtitle}
          </p>
        </div>

        <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
          <div className="w-full shrink-0 space-y-8 xl:w-[440px]">
            <CreditUpload
              parsed={parsed}
              fileName={fileName}
              isLoading={parseLoading}
              error={parseError}
              onFileSelect={handleFileSelect}
            />
            <HandoutForm config={config} onChange={setConfig} />
            <section className="space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-cursor-text-muted">
                3. Customize handout
              </h2>
              <div className="rounded-md border border-cursor-border-emphasis bg-cursor-card p-4">
                <HandoutSectionEditor
                  config={config}
                  onChange={setConfig}
                  onReset={resetConfig}
                />
              </div>
            </section>
            <PdfExportButton
              handoutCount={handoutCount}
              disabled={handoutCount === 0}
              isExporting={isExporting}
              progress={exportProgress}
              onExportPdf={handleExportPdf}
              onPrintFallback={handlePrintFallback}
            />
          </div>

          <div className="min-w-0 flex-1 xl:sticky xl:top-20 xl:self-start">
            <HandoutLivePanel
              config={config}
              creditUrl={firstCreditUrl}
              defaultLogoSrc={DEFAULT_LOGO}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-cursor-border py-8 text-center text-xs text-cursor-text-faint">
        Built by Sachin Agrawal, Cursor Ambassador Stuttgart
        {" · "}
        Codes processed locally in your browser
      </footer>
    </div>
  );
}
