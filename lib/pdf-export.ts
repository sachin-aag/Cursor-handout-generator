"use client";

import { useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  generateFullDocumentHTML,
  generateResourceQRs,
  generateSingleHandoutHTML,
} from "@/lib/generate-handouts";
import { wrapHTML } from "@/lib/handout-template";
import {
  PLACEHOLDER_CREDIT_URL,
  type HandoutConfig,
} from "@/lib/handout-types";
import { generateQRDataURL } from "@/lib/qr-code";

export interface ExportProgress {
  phase: "generating" | "rendering" | "done" | "error";
  current: number;
  total: number;
  message: string;
}

interface RectMm {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface StampLayout {
  qr: RectMm;
  creditUrl: RectMm;
  serial: RectMm;
}

function elementToMm(handoutRect: DOMRect, el: Element): RectMm {
  const rect = el.getBoundingClientRect();
  return {
    x: ((rect.left - handoutRect.left) / handoutRect.width) * 210,
    y: ((rect.top - handoutRect.top) / handoutRect.height) * 297,
    w: (rect.width / handoutRect.width) * 210,
    h: (rect.height / handoutRect.height) * 297,
  };
}

function measureStampLayout(handoutEl: HTMLElement): StampLayout {
  const handoutRect = handoutEl.getBoundingClientRect();
  const qrImg =
    handoutEl.querySelector('[data-field="main-qr"] img') ??
    handoutEl.querySelector('[data-field="main-qr"]');
  const creditUrlEl = handoutEl.querySelector('[data-field="credit-url"]');
  const serialEl = handoutEl.querySelector('[data-field="serial"]');

  if (!qrImg || !creditUrlEl || !serialEl) {
    throw new Error("Could not measure handout stamp positions");
  }

  return {
    qr: elementToMm(handoutRect, qrImg),
    creditUrl: elementToMm(handoutRect, creditUrlEl),
    serial: elementToMm(handoutRect, serialEl),
  };
}

async function waitForIframeReady(iframe: HTMLIFrameElement): Promise<Document> {
  await new Promise<void>((resolve) => {
    if (iframe.contentDocument?.readyState === "complete") resolve();
    else iframe.onload = () => resolve();
  });
  const doc = iframe.contentDocument;
  if (!doc) throw new Error("Failed to load export frame");
  await doc.fonts?.ready;
  await new Promise((r) => setTimeout(r, 400));
  return doc;
}

async function captureSharedBackground(
  config: HandoutConfig,
  defaultLogoSrc: string
): Promise<{ dataUrl: string; layout: StampLayout }> {
  const resourceQRs = await generateResourceQRs(config);
  const handoutHtml = await generateSingleHandoutHTML(
    config,
    PLACEHOLDER_CREDIT_URL,
    0,
    defaultLogoSrc,
    resourceQRs,
    { hidePerPageFields: true }
  );
  const docHtml = wrapHTML([handoutHtml], "Export background", config);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  iframe.style.border = "0";
  iframe.setAttribute("sandbox", "allow-same-origin");
  document.body.appendChild(iframe);
  iframe.srcdoc = docHtml;

  try {
    const doc = await waitForIframeReady(iframe);
    const handoutEl = doc.querySelector(".handout") as HTMLElement | null;
    if (!handoutEl) throw new Error("Handout element not found for export");

    const layout = measureStampLayout(handoutEl);
    const canvas = await html2canvas(handoutEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.92),
      layout,
    };
  } finally {
    document.body.removeChild(iframe);
  }
}

async function generateAllMainQRs(urls: string[]): Promise<string[]> {
  const batchSize = 50;
  const results: string[] = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const qrs = await Promise.all(
      batch.map((url) => generateQRDataURL(url, 400))
    );
    results.push(...qrs);
  }
  return results;
}

export async function exportHandoutsPdf(
  config: HandoutConfig,
  creditUrls: string[],
  defaultLogoSrc: string,
  onProgress: (progress: ExportProgress) => void
): Promise<void> {
  const total = creditUrls.length;

  onProgress({
    phase: "generating",
    current: 0,
    total,
    message: "Rendering shared layout…",
  });

  const [{ dataUrl: backgroundDataUrl, layout }, mainQRs] = await Promise.all([
    captureSharedBackground(config, defaultLogoSrc),
    generateAllMainQRs(creditUrls),
  ]);

  onProgress({
    phase: "rendering",
    current: 0,
    total,
    message: "Building PDF…",
  });

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  const bgAlias = "handout-bg";

  for (let i = 0; i < creditUrls.length; i++) {
    if (i > 0) pdf.addPage();

    pdf.addImage(
      backgroundDataUrl,
      "JPEG",
      0,
      0,
      210,
      297,
      bgAlias,
      "FAST"
    );

    pdf.addImage(
      mainQRs[i],
      "PNG",
      layout.qr.x,
      layout.qr.y,
      layout.qr.w,
      layout.qr.h
    );

    pdf.setFont("courier", "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(136, 136, 136);

    const urlCenterX = layout.creditUrl.x + layout.creditUrl.w / 2;
    const urlBaselineY = layout.creditUrl.y + layout.creditUrl.h * 0.75;
    pdf.text(creditUrls[i], urlCenterX, urlBaselineY, {
      align: "center",
      maxWidth: layout.creditUrl.w,
    });

    const serial = `#${String(i + 1).padStart(3, "0")}`;
    const serialRightX = layout.serial.x + layout.serial.w;
    const serialBaselineY = layout.serial.y + layout.serial.h * 0.85;
    pdf.setTextColor(209, 213, 219);
    pdf.text(serial, serialRightX, serialBaselineY, { align: "right" });

    if (i % 25 === 24 || i === creditUrls.length - 1) {
      onProgress({
        phase: "rendering",
        current: i + 1,
        total,
        message: `Stamping page ${i + 1} of ${total}…`,
      });
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  const filename = `${config.eventName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-handouts.pdf`;
  pdf.save(filename);

  onProgress({
    phase: "done",
    current: total,
    total,
    message: "PDF downloaded.",
  });
}

export function usePrintFallback() {
  const printWindowRef = useRef<Window | null>(null);

  const openPrintView = useCallback(
    async (
      config: HandoutConfig,
      creditUrls: string[],
      defaultLogoSrc: string
    ) => {
      const html = await generateFullDocumentHTML(
        config,
        creditUrls,
        defaultLogoSrc
      );
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(html);
      win.document.close();
      printWindowRef.current = win;
      win.onload = () => win.print();
    },
    []
  );

  return { openPrintView };
}

export async function exportPreviewHtml(
  html: string,
  filename: string
): Promise<void> {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { wrapHTML };
