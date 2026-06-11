import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ParsedCredits } from "./handout-types";

const REFERRAL_PREFIX = "https://cursor.com/referral?code=";
const CODE_PATTERN = /^[A-Z0-9]{8,16}$/i;
const URL_PATTERN = /cursor\.com\/referral\?code=([A-Z0-9]+)/i;

const HEADER_ALIASES = [
  "code",
  "referral",
  "url",
  "link",
  "credit",
  "referral_url",
  "referral url",
  "credit code",
  "credit_code",
];

function normalizeCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(URL_PATTERN);
  if (urlMatch) {
    return `${REFERRAL_PREFIX}${urlMatch[1].toUpperCase()}`;
  }

  if (trimmed.startsWith("http")) {
    try {
      const url = new URL(trimmed);
      const code = url.searchParams.get("code");
      if (code) return `${REFERRAL_PREFIX}${code.toUpperCase()}`;
    } catch {
      return null;
    }
  }

  const codeOnly = trimmed.replace(/[^A-Za-z0-9]/g, "");
  if (CODE_PATTERN.test(codeOnly)) {
    return `${REFERRAL_PREFIX}${codeOnly.toUpperCase()}`;
  }

  return null;
}

function extractFromRows(rows: string[][]): { urls: string[]; invalid: number } {
  const urls: string[] = [];
  let invalid = 0;

  if (rows.length === 0) return { urls, invalid };

  const firstRow = rows[0].map((c) => c.trim().toLowerCase());
  const headerIndex = firstRow.findIndex((cell) =>
    HEADER_ALIASES.includes(cell)
  );
  const dataRows = headerIndex >= 0 ? rows.slice(1) : rows;

  if (headerIndex >= 0) {
    for (const row of dataRows) {
      const cell = row[headerIndex]?.trim() ?? "";
      const normalized = normalizeCode(cell);
      if (normalized) urls.push(normalized);
      else if (cell) invalid++;
    }
    return { urls, invalid };
  }

  for (const row of dataRows) {
    let foundInRow = false;
    for (const cell of row) {
      const normalized = normalizeCode(cell);
      if (normalized) {
        urls.push(normalized);
        foundInRow = true;
      }
    }
    if (!foundInRow && row.some((c) => c.trim())) invalid++;
  }

  return { urls, invalid };
}

function dedupe(urls: string[]): { unique: string[]; removed: number } {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const url of urls) {
    if (seen.has(url)) continue;
    seen.add(url);
    unique.push(url);
  }
  return { unique, removed: urls.length - unique.length };
}

export async function parseCreditFile(file: File): Promise<ParsedCredits> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "xlsx" || ext === "xls") {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: "",
    }) as string[][];
    const { urls, invalid } = extractFromRows(rows);
    const { unique, removed } = dedupe(urls);
    return {
      urls: unique,
      totalFound: urls.length,
      duplicatesRemoved: removed,
      invalidSkipped: invalid,
    };
  }

  const text = await file.text();
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(text, {
      complete: (results) => {
        const rows =
          results.data.length > 0 && Array.isArray(results.data[0])
            ? (results.data as string[][])
            : text
                .split(/\r?\n/)
                .map((line) => [line]);

        const { urls, invalid } = extractFromRows(rows);
        const { unique, removed } = dedupe(urls);
        resolve({
          urls: unique,
          totalFound: urls.length,
          duplicatesRemoved: removed,
          invalidSkipped: invalid,
        });
      },
      error: (error: Error) => reject(error),
      skipEmptyLines: true,
    });
  });
}

export async function parseCreditText(text: string): Promise<ParsedCredits> {
  const rows = text.split(/\r?\n/).map((line) => [line]);
  const { urls, invalid } = extractFromRows(rows);
  const { unique, removed } = dedupe(urls);
  return {
    urls: unique,
    totalFound: urls.length,
    duplicatesRemoved: removed,
    invalidSkipped: invalid,
  };
}
