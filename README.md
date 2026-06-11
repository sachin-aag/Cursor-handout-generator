# Cursor Event Credit Handout Generator

Generate **print-ready A4 handouts** for in-person Cursor events. Upload a list of credit codes, customize your event branding, and download a PDF — **one unique handout per attendee**.

Everything runs in your browser. Credit codes are never uploaded to a server.

Design inspired by [Cursor Thailand](https://cursorthailand.com/).

## What it does

- Parses **CSV**, **TXT**, or **XLSX** files containing Cursor referral URLs or raw codes
- Lets you customize event name, location, date, tagline, sponsor, and resource links
- Always-visible **live preview** on the right while you edit on the left
- Editable redemption steps, info boxes, sponsor footer, and resource links
- Persists your customization in **localStorage**
- Fast **multi-page PDF** export (shared layout + per-page QR stamp) or **print view** fallback

Each handout includes:

- Event branding header with Cursor logo
- Unique QR code for the attendee's credit
- Redemption instructions
- Quick-reference info about Cursor
- Optional sponsor footer and resource QR links

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How to use

1. **Upload codes** — drag and drop a CSV or XLSX file with one referral URL or code per row
2. **Print settings** — choose color vs black & white in the left sidebar
3. **Customize handout** — edit event details, copy, links, sponsor, and branding in the left form while the live preview updates on the right
4. **Preview** — use Fit or 100% zoom on the live preview; watch for overflow warnings if content is too long
5. **Export** — click "Download N-page PDF" or use "Print view" as a fallback

Print on a **color printer** at 100% scale for best results. Dark backgrounds require `print-color-adjust: exact` (enabled in the template).

## Input file format

The parser accepts:

### Plain URL list (one per line)

```text
https://cursor.com/referral?code=2FL7FBAUCFU7
https://cursor.com/referral?code=WYA0XSSTS664
```

### Raw codes

```text
2FL7FBAUCFU7
WYA0XSSTS664
```

### CSV with headers

| code | name |
|------|------|
| 2FL7FBAUCFU7 | Alice |
| WYA0XSSTS664 | Bob |

Recognized column names: `code`, `referral`, `url`, `link`, `credit`, `referral_url`, `credit_code`.

### XLSX

Same as CSV — codes can be in any column; header-named columns are preferred.

Duplicate codes are removed automatically (each code can only be assigned to one person).

## Customization

| Field | Default |
|-------|---------|
| Event name | Cursor Meetup Stuttgart |
| Location | Stuttgart, Germany |
| Date & time | Friday, May 22, 2026 · 3:00 PM – 9:00 PM |
| Tagline | Thanks for joining us — this credit is yours. Scan to redeem. |
| Credit amount | $20 |
| Sponsor | CREATORS / creators-ecosystem.de |
| Resource links | Learn Cursor, About CREATORS |

You can override the Cursor logo and upload a sponsor logo. Tagline presets are available in the customization form, or write your own. Use `**text**` in bullet fields for bold (e.g. `**cursor.com**`). Settings are saved automatically in your browser.

Editable sections: header, tagline & credit, redemption steps, three info boxes, resource QR links, sponsor footer, and branding. Longer copy sections are collapsed by default to keep the workflow compact.

## Design

Visual language based on [cursorthailand.com](https://cursorthailand.com/):

- Dark canvas `#14120B` with light text `#EDECEC`
- Cursor Orange `#F54E00` accents
- Inter + JetBrains Mono typography (CursorGothic/Berkeley Mono when bundled)
- Subtle grid background, card surfaces, gradient dividers

## Deploy

Deploy to [Vercel](https://vercel.com) or any static host:

```bash
npm run build
npm start
```

No environment variables or server-side APIs required.

## Privacy

All file parsing, QR generation, and PDF export happen **entirely in the browser**. Your credit codes never leave your device.

## Legacy CLI

The original Node.js script is still available for local batch generation:

```bash
npx tsx generate-tickets.ts
```

This reads from `cursor_credits` and outputs to `tickets/` using Chrome headless (macOS only for PDF).

## Troubleshooting

**PDF export fails for very large batches**  
PDF export renders the shared layout once and stamps each page's QR code (much faster than before). For extremely large batches or if export fails, use **Print view** and save as PDF from your browser's print dialog.

**Content cut off on the printed page**  
The live panel shows an overflow warning if text exceeds the A4 layout. Shorten redemption steps or info box bullets in the customization form.

**Dark backgrounds print as white**  
Enable "Background graphics" in your browser's print settings. Use a color printer.

**QR code doesn't scan**  
Ensure the export is at 100% scale. Test with the preview handout first.

**No codes found in file**  
Check that rows contain full referral URLs or 8–16 character alphanumeric codes.

## License

MIT
