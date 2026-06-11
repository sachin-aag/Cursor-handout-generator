import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CREDITS_FILE = path.join(__dirname, "cursor_credits");
const OUTPUT_DIR = path.join(__dirname, "tickets");
const CURSOR_LOGO_SVG = fs.readFileSync(
  path.join(__dirname, "LOCKUP_HORIZONTAL_2D_LIGHT.svg"),
  "utf-8"
);
const CREATORS_LOGO_B64 = fs
  .readFileSync(path.join(__dirname, "..", "public", "images", "logo-icon.png"))
  .toString("base64");

const CREATORS_URL = "https://www.creators-ecosystem.de/en";
const LEARN_URL = "https://cursor.com/learn";

async function generateQRDataURL(text: string, size: number): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

function generateTicketHTML(
  creditUrl: string,
  index: number,
  mainQR: string,
  creatorsQR: string,
  learnQR: string
): string {
  const logoDataURL = `data:image/svg+xml;base64,${Buffer.from(CURSOR_LOGO_SVG).toString("base64")}`;

  return `<div class="ticket">
  <div class="ticket-inner">
    <img class="cursor-logo" src="${logoDataURL}" alt="Cursor" />
    <div class="event-title">Cursor Meetup Stuttgart</div>
    <div class="event-date">Friday, May 22 &middot; 3:00 PM – 9:00 PM</div>

    <div class="value-badge">
      <span class="dollar">$20</span>
      <span class="label">Cursor<br>Credit</span>
    </div>

    <div class="redeem-section">
      <div class="redeem-left">
        <div class="main-qr">
          <img src="${mainQR}" alt="Credit QR Code" />
        </div>
      </div>
      <div class="redeem-right">
        <div class="redeem-title">How to Redeem</div>
        <ol class="redeem-steps">
          <li>Create a free account at <strong>cursor.com</strong></li>
          <li>Log in, then scan this QR code</li>
          <li>Click <strong>"Redeem"</strong> on the page</li>
          <li>Credits appear in <strong>Dashboard &gt; Credits</strong></li>
          <li>Start a Pro plan with a payment method</li>
          <li>Credits auto-apply to your next invoice</li>
        </ol>
        <div class="redeem-note">Only for individual accounts (not Team plans). Hard refresh if credits don't appear.</div>
      </div>
    </div>
    <div class="credit-url">${creditUrl}</div>

    <div class="info-boxes">
      <div class="info-box">
        <div class="info-box-title">What is Cursor?</div>
        <ul>
          <li>AI-powered code editor built on VS Code</li>
          <li>Understands your entire codebase</li>
          <li><strong>Cmd+K</strong> to edit code with AI</li>
          <li><strong>Cmd+L</strong> to chat about your code</li>
          <li><strong>Tab</strong> to accept smart completions</li>
        </ul>
      </div>
      <div class="info-box">
        <div class="info-box-title">Get Started</div>
        <ul>
          <li>Download at <strong>cursor.com</strong></li>
          <li>Import your VS Code settings in one click</li>
          <li>All your extensions work out of the box</li>
          <li>Use this <strong>$20 credit</strong> to go Pro</li>
          <li>Learn tips at <strong>cursor.com/learn</strong></li>
        </ul>
      </div>
      <div class="info-box">
        <div class="info-box-title">Pro Tips</div>
        <ul>
          <li>Select code + Cmd+K to refactor anything</li>
          <li>@ mention files in chat for context</li>
          <li>Use <strong>Skills</strong> to teach Cursor your stack</li>
          <li>Multi-file edits across your whole project</li>
          <li>Works with any language or framework</li>
        </ul>
      </div>
    </div>

    <div class="resources">
      <div class="resource-item">
        <div class="qr-small">
          <img src="${learnQR}" alt="Learn Cursor" />
        </div>
        <span class="resource-label">Learn Cursor</span>
      </div>
      <div class="resource-item">
        <div class="qr-small">
          <img src="${creatorsQR}" alt="About CREATORS" />
        </div>
        <span class="resource-label">About CREATORS</span>
      </div>
    </div>

    <div class="divider"></div>

    <div class="footer">
      <div class="footer-text">Presented by <span>CREATORS</span></div>
      <div class="footer-url">creators-ecosystem.de</div>
    </div>

    <span class="ticket-number">#${String(index + 1).padStart(3, "0")}</span>
  </div>
</div>`;
}

function wrapHTML(tickets: string[]): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cursor Credit Tickets</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: #ffffff;
    color: #1a1a1a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .ticket {
    width: 210mm;
    height: 297mm;
    padding: 10mm;
    page-break-after: always;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .ticket:last-child { page-break-after: auto; }

  .ticket-inner {
    width: 190mm;
    height: 277mm;
    border: 2px solid #1a1a1a;
    border-radius: 12px;
    padding: 10mm 12mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: hidden;
    background: #ffffff;
  }

  .ticket-inner::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 16px 16px;
    pointer-events: none;
  }

  .cursor-logo { width: 60mm; height: auto; margin-bottom: 5mm; position: relative; z-index: 1; filter: contrast(2); }

  .event-title {
    font-size: 14pt; font-weight: 700; color: #000000;
    letter-spacing: 1px; text-transform: uppercase;
    margin-bottom: 1.5mm; position: relative; z-index: 1;
  }

  .event-date {
    font-size: 9pt; font-weight: 600; color: #333333;
    margin-bottom: 5mm; position: relative; z-index: 1;
  }

  .value-badge {
    display: inline-flex; align-items: center; gap: 4mm;
    background: #f3f4f6;
    border: 1.5px solid #1a1a1a; border-radius: 8px;
    padding: 3mm 7mm; margin-bottom: 6mm;
    position: relative; z-index: 1;
  }
  .value-badge .dollar {
    font-family: 'JetBrains Mono', monospace; font-size: 30pt; font-weight: 700;
    color: #1a1a1a;
  }
  .value-badge .label { font-size: 11pt; color: #333333; font-weight: 600; }

  .main-qr {
    border-radius: 10px; padding: 4mm; margin-bottom: 3mm;
    position: relative; z-index: 1; border: 2px solid #1a1a1a;
  }
  .main-qr img { width: 50mm; height: 50mm; display: block; }

  .credit-url {
    font-family: 'JetBrains Mono', monospace; font-size: 7pt;
    color: #555555; margin-bottom: 6mm; position: relative; z-index: 1;
    word-break: break-all; text-align: center; max-width: 140mm;
  }

  /* --- Redeem Section --- */
  .redeem-section {
    display: flex;
    align-items: center;
    gap: 6mm;
    width: 166mm;
    margin-bottom: 4mm;
    position: relative;
    z-index: 1;
  }

  .redeem-left {
    flex-shrink: 0;
  }

  .redeem-right {
    flex: 1;
  }

  .redeem-title {
    font-size: 10pt;
    font-weight: 700;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2.5mm;
  }

  .redeem-steps {
    padding-left: 5mm;
    margin: 0;
  }

  .redeem-steps li {
    font-size: 8pt;
    line-height: 1.5;
    color: #1a1a1a;
    margin-bottom: 1mm;
  }

  .redeem-steps li strong {
    color: #000000;
    font-weight: 700;
  }

  .redeem-note {
    font-size: 6.5pt;
    color: #555555;
    margin-top: 2mm;
    font-style: italic;
  }

  /* --- Info Boxes --- */
  .info-boxes {
    display: flex;
    gap: 4mm;
    width: 166mm;
    margin-bottom: 6mm;
    position: relative;
    z-index: 1;
    flex: 1;
  }

  .info-box {
    flex: 1;
    background: #f9fafb;
    border: 1.5px solid #1a1a1a;
    border-radius: 8px;
    padding: 4mm 5mm;
    display: flex;
    flex-direction: column;
  }

  .info-box-title {
    font-size: 9pt;
    font-weight: 700;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 3mm;
    padding-bottom: 2mm;
    border-bottom: 1px solid #1a1a1a;
  }

  .info-box ul {
    list-style: none;
    padding: 0;
  }

  .info-box li {
    font-size: 8pt;
    line-height: 1.6;
    color: #1a1a1a;
    padding-left: 4mm;
    position: relative;
    margin-bottom: 1.5mm;
  }

  .info-box li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 3px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #1a1a1a;
  }

  .info-box li strong {
    color: #000000;
    font-weight: 700;
  }

  /* --- Resources --- */
  .resources {
    display: flex; gap: 14mm; align-items: center;
    margin-bottom: 5mm; position: relative; z-index: 1;
  }
  .resource-item { display: flex; flex-direction: column; align-items: center; gap: 2mm; }
  .resource-item .qr-small { border-radius: 6px; padding: 2.5mm; border: 2px solid #1a1a1a; }
  .resource-item .qr-small img { width: 22mm; height: 22mm; display: block; }
  .resource-item .resource-label {
    font-size: 7pt; color: #333333; font-weight: 600; text-transform: uppercase;
    letter-spacing: 1.5px; text-align: center;
  }

  .divider {
    width: 100mm; height: 1px;
    background: linear-gradient(90deg, transparent, #d1d5db, transparent);
    margin-bottom: 4mm; position: relative; z-index: 1;
  }

  .footer {
    display: flex; flex-direction: column; align-items: center; gap: 0;
    position: relative; z-index: 1;
  }
  .footer-text { font-size: 9pt; color: #333333; }
  .footer-text span { color: #000000; font-weight: 700; letter-spacing: 2px; }
  .footer-url {
    font-family: 'JetBrains Mono', monospace; font-size: 7pt;
    color: #333333; margin-top: 1mm;
  }

  .ticket-number {
    position: absolute; bottom: 4mm; right: 6mm;
    font-family: 'JetBrains Mono', monospace; font-size: 6.5pt; color: #d1d5db;
  }
</style>
</head>
<body>
${tickets.join("\n")}
</body>
</html>`;
}

async function main() {
  const credits = fs
    .readFileSync(CREDITS_FILE, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("http"));

  console.log(`Found ${credits.length} credit codes`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const creatorsQR = await generateQRDataURL(CREATORS_URL, 200);
  const learnQR = await generateQRDataURL(LEARN_URL, 200);

  const count = Math.min(60, credits.length);
  const tickets: string[] = [];
  for (let i = 0; i < count; i++) {
    const mainQR = await generateQRDataURL(credits[i], 400);
    const ticket = generateTicketHTML(credits[i], i, mainQR, creatorsQR, learnQR);
    tickets.push(ticket);
    console.log(`Generated ticket ${i + 1}/${count}`);
  }

  const html = wrapHTML(tickets);
  const htmlPath = path.join(OUTPUT_DIR, "tickets-all.html");
  fs.writeFileSync(htmlPath, html);

  // Convert to PDF via Chrome headless
  const pdfPath = path.join(OUTPUT_DIR, "tickets-all.pdf");
  execSync(
    `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-margins --print-background "file://${htmlPath}"`,
    { stdio: "pipe" }
  );

  console.log(`PDF with ${count} tickets: ${pdfPath}`);
}

main().catch(console.error);
