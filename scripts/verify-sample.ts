import { readFileSync, writeFileSync } from "fs";
import { DEFAULT_HANDOUT_CONFIG } from "../lib/handout-types";
import { generateAllHandouts } from "../lib/generate-handouts";
import { parseCreditText } from "../lib/parse-credits";
import { wrapHTML } from "../lib/handout-template";

async function main() {
  const csv = readFileSync(
    "Cursor Meetup Stuttgart - Guests - 2026-06-10-22-02-24.csv",
    "utf-8"
  );
  const parsed = await parseCreditText(csv);
  const sample = parsed.urls.slice(0, 3);
  const handouts = await generateAllHandouts(
    DEFAULT_HANDOUT_CONFIG,
    sample,
    "/cursor-logo.svg"
  );
  const html = wrapHTML(handouts.map((h) => h.html), "Sample", DEFAULT_HANDOUT_CONFIG);
  writeFileSync("tickets/handouts-sample.html", html);

  console.log("Parsed URLs:", parsed.urls.length);
  console.log("Generated handouts:", handouts.length);
  console.log("Unique URLs:", new Set(handouts.map((h) => h.creditUrl)).size);
  console.log("Has QR:", handouts[0].html.includes("data:image/png;base64"));
  console.log("Has white theme:", html.includes("#ffffff"));
  console.log("Serial numbers:", handouts.map((_, i) => `#${String(i + 1).padStart(3, "0")}`).join(", "));
}

main().catch(console.error);
