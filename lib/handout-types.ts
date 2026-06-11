export type DateFormat = "prose" | "mono";
export type PrintMode = "color" | "bw";

export interface ResourceLink {
  label: string;
  url: string;
}

export interface InfoBox {
  title: string;
  items: string[];
}

export interface HandoutConfig {
  eventName: string;
  location: string;
  dateTime: string;
  dateFormat: DateFormat;
  tagline: string;
  creditAmount: string;
  communityName: string;
  cursorLogoDataUrl: string | null;
  sponsorName: string;
  sponsorUrl: string;
  sponsorLogoDataUrl: string | null;
  resourceLinks: ResourceLink[];
  printMode: PrintMode;
  redeemSteps: string[];
  redeemNote: string;
  infoBoxes: InfoBox[];
}

export interface ParsedCredits {
  urls: string[];
  totalFound: number;
  duplicatesRemoved: number;
  invalidSkipped: number;
}

export interface HandoutQRData {
  mainQR: string;
  resourceQRs: string[];
}

export interface GeneratedHandout {
  index: number;
  creditUrl: string;
  html: string;
}

export const MAX_REDEEM_STEPS = 7;
export const INFO_BOX_COUNT = 3;
export const MAX_INFO_BOX_ITEMS = 6;
export const MAX_RESOURCE_LINKS = 3;

export const TAGLINE_PRESETS = [
  "Thanks for joining us — this credit is yours. Scan to redeem.",
  "One credit, one builder. Redeem below and start shipping.",
  "Built for builders. Your personal Cursor credit is ready.",
  "Welcome to the community — grab your credit and go Pro.",
] as const;

export const DEFAULT_REDEEM_STEPS = [
  "Create a free account at **cursor.com**",
  "Log in, then scan this QR code",
  'Click **"Redeem"** on the page',
  "Credits appear in **Dashboard > Credits**",
  "Start a Pro plan with a payment method",
  "Credits auto-apply to your next invoice",
];

export const DEFAULT_REDEEM_NOTE =
  "Individual accounts only (not Team plans). Hard refresh if credits don't appear.";

export const DEFAULT_INFO_BOXES: InfoBox[] = [
  {
    title: "What is Cursor?",
    items: [
      "AI-powered code editor built on VS Code",
      "Understands your entire codebase",
      "**Cmd+K** to edit code with AI",
      "**Cmd+L** to chat about your code",
      "**Tab** to accept smart completions",
    ],
  },
  {
    title: "Get Started",
    items: [
      "Download at **cursor.com**",
      "Import your VS Code settings in one click",
      "All your extensions work out of the box",
      "Use this **$20 credit** to go Pro",
      "Learn tips at **cursor.com/learn**",
    ],
  },
  {
    title: "Pro Tips",
    items: [
      "Select code + Cmd+K to refactor anything",
      "@ mention files in chat for context",
      "Use **Skills** to teach Cursor your stack",
      "Multi-file edits across your whole project",
      "Works with any language or framework",
    ],
  },
];

export const DEFAULT_HANDOUT_CONFIG: HandoutConfig = {
  eventName: "Cursor Meetup Stuttgart",
  location: "Stuttgart, Germany",
  dateTime: "Friday, May 22, 2026 · 3:00 PM – 9:00 PM",
  dateFormat: "prose",
  tagline: TAGLINE_PRESETS[0],
  creditAmount: "$20",
  communityName: "",
  cursorLogoDataUrl: null,
  sponsorName: "",
  sponsorUrl: "",
  sponsorLogoDataUrl: null,
  resourceLinks: [{ label: "Learn Cursor", url: "https://cursor.com/learn" }],
  printMode: "color",
  redeemSteps: [...DEFAULT_REDEEM_STEPS],
  redeemNote: DEFAULT_REDEEM_NOTE,
  infoBoxes: DEFAULT_INFO_BOXES.map((box) => ({
    title: box.title,
    items: [...box.items],
  })),
};

export const DEFAULT_LOGO_SRC = "/LOCKUP_HORIZONTAL_2D_LIGHT.svg";

export const PLACEHOLDER_CREDIT_URL =
  "https://cursor.com/referral?code=EXAMPLE123";

export const HANDOUT_CONFIG_STORAGE_KEY = "handout-config:v1";

export function formatDisplayDate(config: HandoutConfig): string {
  if (config.dateFormat === "mono") {
    const venue = config.location.split(",")[0]?.trim().toUpperCase() || "VENUE";
    const match = config.dateTime.match(/(\d{4})[^\d]*(\d{1,2})[^\d]*(\d{1,2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${y}.${m.padStart(2, "0")}.${d.padStart(2, "0")} · ${venue}`;
    }
  }
  return config.dateTime;
}

export function sponsorDisplayUrl(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(
      /^www\./,
      ""
    );
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

export function normalizeHandoutConfig(
  partial: Partial<HandoutConfig> | null | undefined
): HandoutConfig {
  const base = { ...DEFAULT_HANDOUT_CONFIG, ...partial };
  return {
    ...base,
    redeemSteps: (partial?.redeemSteps ?? base.redeemSteps).slice(
      0,
      MAX_REDEEM_STEPS
    ),
    infoBoxes: Array.from({ length: INFO_BOX_COUNT }, (_, i) => {
      const box = partial?.infoBoxes?.[i] ?? base.infoBoxes[i] ?? DEFAULT_INFO_BOXES[i];
      return {
        title: box?.title ?? DEFAULT_INFO_BOXES[i].title,
        items: (box?.items ?? DEFAULT_INFO_BOXES[i].items).slice(
          0,
          MAX_INFO_BOX_ITEMS
        ),
      };
    }),
    resourceLinks: (partial?.resourceLinks ?? base.resourceLinks).slice(
      0,
      MAX_RESOURCE_LINKS
    ),
  };
}
