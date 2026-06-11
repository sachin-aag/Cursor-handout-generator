"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { HandoutConfig } from "@/lib/handout-types";
import { useHandoutPreviewHtml } from "@/lib/use-handout-preview-html";
import { cn } from "@/lib/utils";

const PREVIEW_SCALE_FIT = 0.58;

type ZoomMode = "fit" | "full";

interface HandoutPreviewProps {
  config: HandoutConfig;
  creditUrl: string | null;
  defaultLogoSrc: string;
}

function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-md border border-cursor-border-emphasis bg-cursor-surface p-0.5">
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            value === id
              ? "bg-cursor-orange/15 text-cursor-orange"
              : "text-cursor-text-muted hover:text-cursor-text"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function PreviewIframe({
  srcdoc,
  scale,
  title,
  onLoad,
  className,
}: {
  srcdoc: string;
  scale: number;
  title: string;
  onLoad?: (iframe: HTMLIFrameElement) => void;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !srcdoc) return;
    iframe.srcdoc = srcdoc;
  }, [srcdoc]);

  const handleLoad = () => {
    const iframe = iframeRef.current;
    if (iframe) onLoad?.(iframe);
  };

  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{
        width: `calc(210mm * ${scale})`,
        height: `calc(297mm * ${scale})`,
      }}
    >
      <iframe
        ref={iframeRef}
        title={title}
        className="border-0"
        onLoad={handleLoad}
        style={{
          width: "210mm",
          height: "297mm",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}

function OverflowBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        Content exceeds the printable page — shorten steps or bullets before
        printing.
      </span>
    </div>
  );
}

export function HandoutLivePanel({
  config,
  creditUrl,
  defaultLogoSrc,
}: HandoutPreviewProps) {
  const [zoom, setZoom] = useState<ZoomMode>("fit");
  const [overflows, setOverflows] = useState(false);

  const { srcdoc, loading, error } = useHandoutPreviewHtml(
    config,
    creditUrl,
    defaultLogoSrc
  );

  const checkOverflow = useCallback((iframe: HTMLIFrameElement) => {
    try {
      const doc = iframe.contentDocument;
      const inner = doc?.querySelector(".handout-inner");
      if (!inner) {
        setOverflows(false);
        return;
      }
      setOverflows(inner.scrollHeight > inner.clientHeight + 2);
    } catch {
      setOverflows(false);
    }
  }, []);

  const previewScale = zoom === "fit" ? PREVIEW_SCALE_FIT : 1;

  return (
    <div className="relative flex h-full min-h-[480px] flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-cursor-text-muted">
          Live preview
        </h2>
        <div className="flex items-center gap-2">
          <SegmentedToggle
            value={zoom}
            options={[
              { id: "fit", label: "Fit" },
              { id: "full", label: "100%" },
            ]}
            onChange={setZoom}
          />
          {loading && (
            <span className="flex items-center gap-1.5 text-xs text-cursor-text-faint">
              <Loader2 className="h-3 w-3 animate-spin" />
              Updating…
            </span>
          )}
        </div>
      </div>

      <OverflowBanner visible={overflows} />

      <div className="relative flex-1 rounded-md border border-cursor-border-emphasis bg-white shadow-sm">
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
        <div
          className={cn(
            "flex justify-center p-2",
            zoom === "full" ? "overflow-auto" : "overflow-hidden"
          )}
        >
          <PreviewIframe
            srcdoc={srcdoc}
            scale={previewScale}
            title="Handout preview"
            onLoad={checkOverflow}
          />
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-cursor-text-faint">
        {creditUrl
          ? "Showing handout #001 (first uploaded code)"
          : "Upload codes to preview with a real QR code"}
      </p>
    </div>
  );
}

/** @deprecated Use HandoutLivePanel */
export const HandoutPreview = HandoutLivePanel;
