import type { HandoutConfig } from "./handout-types";
import { formatDisplayDate, sponsorDisplayUrl } from "./handout-types";

export interface HandoutRenderOptions {
  /** Hide per-page fields for shared-background PDF export */
  hidePerPageFields?: boolean;
}

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export function handoutStyles(config: HandoutConfig): string {
  const isBw = config.printMode === "bw";
  const accent = isBw ? "#1a1a1a" : "#F54E00";
  const accentStripe = isBw ? "#888888" : "#A8B4C8";

  return `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #ffffff;
    color: #1a1a1a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .handout {
    width: 210mm;
    height: 297mm;
    padding: 10mm;
    page-break-after: always;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
  }
  .handout:last-child { page-break-after: auto; }

  .handout-inner {
    width: 190mm;
    height: 277mm;
    border: 1.5px solid #1a1a1a;
    border-radius: 6px;
    padding: 10mm 12mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: hidden;
    background: #ffffff;
  }

  .handout-inner::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }

  .logo-row {
    display: flex;
    align-items: center;
    gap: 4mm;
    margin-bottom: 4mm;
    position: relative;
    z-index: 1;
  }

  .cursor-logo { width: 52mm; height: auto; }

  .community-name {
    font-size: 14pt;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #1a1a1a;
  }

  .handout-eyebrow {
    font-size: 8pt;
    font-weight: 500;
    color: #666666;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 2mm;
    position: relative;
    z-index: 1;
  }

  .event-title {
    font-size: 16pt;
    font-weight: 700;
    color: #000000;
    letter-spacing: -0.01em;
    margin-bottom: 1.5mm;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .event-location {
    font-size: 9pt;
    font-weight: 400;
    color: #888888;
    margin-bottom: 1.5mm;
    position: relative;
    z-index: 1;
  }

  .event-date {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 8.5pt;
    font-weight: 400;
    color: #555555;
    margin-bottom: 3mm;
    position: relative;
    z-index: 1;
  }

  .handout-tagline {
    font-size: 9pt;
    line-height: 1.5;
    color: #555555;
    text-align: center;
    max-width: 140mm;
    margin-bottom: 5mm;
    position: relative;
    z-index: 1;
  }

  .value-badge {
    display: inline-flex;
    align-items: center;
    gap: 4mm;
    background: #f3f4f6;
    border: 1.5px solid #1a1a1a;
    border-left: 2px solid ${accentStripe};
    border-radius: 6px;
    padding: 3mm 7mm;
    margin-bottom: 6mm;
    position: relative;
    z-index: 1;
  }
  .value-badge .dollar {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 28pt;
    font-weight: 700;
    color: ${accent};
  }
  .value-badge .label {
    font-size: 11pt;
    color: #333333;
    font-weight: 600;
  }

  .main-qr {
    border-radius: 6px;
    padding: 3mm;
    margin-bottom: 3mm;
    position: relative;
    z-index: 1;
    border: 1.5px solid #1a1a1a;
    background: #ffffff;
  }
  .main-qr img { width: 48mm; height: 48mm; display: block; }

  .credit-url {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 6.5pt;
    color: #888888;
    margin-bottom: 5mm;
    position: relative;
    z-index: 1;
    word-break: break-all;
    text-align: center;
    max-width: 140mm;
  }

  .redeem-section {
    display: flex;
    align-items: flex-start;
    gap: 6mm;
    width: 100%;
    margin-bottom: 4mm;
    position: relative;
    z-index: 1;
  }

  .redeem-left { flex-shrink: 0; }
  .redeem-right { flex: 1; }

  .redeem-title {
    font-size: 9pt;
    font-weight: 700;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 2.5mm;
  }

  .redeem-steps {
    padding-left: 5mm;
    margin: 0;
  }

  .redeem-steps li {
    font-size: 7.5pt;
    line-height: 1.55;
    color: #333333;
    margin-bottom: 1mm;
  }

  .redeem-steps li strong {
    color: #000000;
    font-weight: 600;
  }

  .redeem-note {
    font-size: 6.5pt;
    color: #888888;
    margin-top: 2mm;
    font-style: italic;
  }

  .info-boxes {
    display: flex;
    gap: 3mm;
    width: 100%;
    margin-bottom: 5mm;
    position: relative;
    z-index: 1;
    flex: 1;
  }

  .info-box {
    flex: 1;
    background: #f9fafb;
    border: 1.5px solid #1a1a1a;
    border-radius: 6px;
    padding: 3.5mm 4mm;
    display: flex;
    flex-direction: column;
  }

  .info-box-title {
    font-size: 8pt;
    font-weight: 700;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 2.5mm;
    padding-bottom: 2mm;
    border-bottom: 1px solid #1a1a1a;
  }

  .info-box ul { list-style: none; padding: 0; }

  .info-box li {
    font-size: 7pt;
    line-height: 1.55;
    color: #333333;
    padding-left: 3.5mm;
    position: relative;
    margin-bottom: 1.2mm;
  }

  .info-box li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 3px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${accent};
  }

  .info-box li strong {
    color: #000000;
    font-weight: 600;
  }

  .resources {
    display: flex;
    gap: 12mm;
    align-items: center;
    justify-content: center;
    margin-bottom: 4mm;
    position: relative;
    z-index: 1;
    flex-wrap: wrap;
  }

  .resource-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2mm;
  }

  .resource-item .qr-small {
    border-radius: 6px;
    padding: 2mm;
    border: 1.5px solid #1a1a1a;
    background: #ffffff;
  }

  .resource-item .qr-small img {
    width: 20mm;
    height: 20mm;
    display: block;
  }

  .resource-item .resource-label {
    font-size: 6.5pt;
    color: ${isBw ? "#333333" : accent};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: center;
  }

  .divider {
    width: 100mm;
    height: 1px;
    background: linear-gradient(90deg, transparent, #d1d5db, transparent);
    margin-bottom: 3mm;
    position: relative;
    z-index: 1;
  }

  .footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1mm;
    position: relative;
    z-index: 1;
  }

  .footer-row {
    display: flex;
    align-items: center;
    gap: 2.5mm;
  }

  .sponsor-logo {
    width: 7mm;
    height: 7mm;
    border-radius: 50%;
    object-fit: cover;
    ${isBw ? "filter: grayscale(100%);" : ""}
  }

  .footer-text {
    font-size: 8.5pt;
    color: #555555;
  }

  .footer-text span {
    color: #000000;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .footer-url {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 6.5pt;
    color: #888888;
  }

  .handout-number {
    position: absolute;
    bottom: 4mm;
    right: 6mm;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 6.5pt;
    color: #d1d5db;
  }
`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape text then convert **bold** markers to &lt;strong&gt; */
export function formatInlineBold(text: string): string {
  return escapeHtml(text).replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );
}

function renderListItems(items: string[]): string {
  return items
    .map((item) => `<li>${formatInlineBold(item)}</li>`)
    .join("\n          ");
}

function renderRedeemSteps(steps: string[]): string {
  return steps
    .map((step) => `<li>${formatInlineBold(step)}</li>`)
    .join("\n          ");
}

export function generateHandoutHTML(
  config: HandoutConfig,
  creditUrl: string,
  index: number,
  mainQR: string,
  resourceQRs: string[],
  defaultLogoSrc: string,
  options: HandoutRenderOptions = {}
): string {
  const { hidePerPageFields = false } = options;
  const logoSrc = config.cursorLogoDataUrl ?? defaultLogoSrc;
  const displayDate = formatDisplayDate(config);
  const sponsorHost = sponsorDisplayUrl(config.sponsorUrl);
  const creditLabel = escapeHtml(config.creditAmount);

  const resourceLinks = config.resourceLinks.slice(0, 3);
  const resourceItems = resourceLinks
    .map(
      (link, i) => `
      <div class="resource-item">
        <div class="qr-small">
          <img src="${resourceQRs[i] ?? ""}" alt="${escapeHtml(link.label)}" />
        </div>
        <span class="resource-label">${escapeHtml(link.label)}</span>
      </div>`
    )
    .join("");

  const communityBlock = config.communityName
    ? `<span class="community-name">${escapeHtml(config.communityName)}</span>`
    : "";

  const sponsorLogoBlock = config.sponsorLogoDataUrl
    ? `<img class="sponsor-logo" src="${config.sponsorLogoDataUrl}" alt="${escapeHtml(config.sponsorName)}" />`
    : "";

  const hasSponsor = Boolean(config.sponsorName.trim());
  const footerBlock = hasSponsor
    ? `<div class="divider"></div>
    <div class="footer">
      <div class="footer-row">
        ${sponsorLogoBlock}
        <div class="footer-text">Presented by <span>${escapeHtml(config.sponsorName.toUpperCase())}</span></div>
      </div>
      ${config.sponsorUrl.trim() ? `<div class="footer-url">${escapeHtml(sponsorHost)}</div>` : ""}
    </div>`
    : "";

  const resourcesBlock =
    resourceLinks.length > 0
      ? `<div class="resources">${resourceItems}</div>`
      : "";

  const qrSrc = hidePerPageFields ? TRANSPARENT_PIXEL : mainQR;
  const displayCreditUrl = hidePerPageFields ? "" : creditUrl;
  const serialLabel = hidePerPageFields
    ? ""
    : `#${String(index + 1).padStart(3, "0")}`;

  const infoBoxesHtml = config.infoBoxes
    .map(
      (box, boxIndex) => `
      <div class="info-box" data-field="info-box-${boxIndex}">
        <div class="info-box-title" data-field="info-box-title-${boxIndex}">${escapeHtml(box.title)}</div>
        <ul>
          ${renderListItems(box.items)}
        </ul>
      </div>`
    )
    .join("");

  return `<div class="handout">
  <div class="handout-inner">
    <div class="logo-row">
      <img class="cursor-logo" src="${logoSrc}" alt="Cursor" data-field="logo" />
      ${communityBlock}
    </div>

    <div class="handout-eyebrow" data-field="eyebrow">Event Credit</div>
    <div class="event-title" data-field="event-name">${escapeHtml(config.eventName)}</div>
    ${config.location ? `<div class="event-location" data-field="location">${escapeHtml(config.location)}</div>` : ""}
    <div class="event-date" data-field="date">${escapeHtml(displayDate)}</div>
    <div class="handout-tagline" data-field="tagline">${escapeHtml(config.tagline)}</div>

    <div class="value-badge" data-field="value-badge">
      <span class="dollar">${creditLabel}</span>
      <span class="label">Cursor<br>Credit</span>
    </div>

    <div class="redeem-section">
      <div class="redeem-left">
        <div class="main-qr" data-field="main-qr">
          <img src="${qrSrc}" alt="Credit QR Code" />
        </div>
      </div>
      <div class="redeem-right">
        <div class="redeem-title" data-field="redeem-title">How to Redeem</div>
        <ol class="redeem-steps" data-field="redeem-steps">
          ${renderRedeemSteps(config.redeemSteps)}
        </ol>
        <div class="redeem-note" data-field="redeem-note">${escapeHtml(config.redeemNote)}</div>
      </div>
    </div>
    <div class="credit-url" data-field="credit-url">${escapeHtml(displayCreditUrl)}</div>

    <div class="info-boxes" data-field="info-boxes">
      ${infoBoxesHtml}
    </div>

    ${resourcesBlock}

    ${footerBlock}

    <span class="handout-number" data-field="serial">${serialLabel}</span>
  </div>
</div>`;
}

export function wrapHTML(
  handouts: string[],
  title: string,
  config: HandoutConfig
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<style>${handoutStyles(config)}</style>
</head>
<body>
${handouts.join("\n")}
</body>
</html>`;
}
