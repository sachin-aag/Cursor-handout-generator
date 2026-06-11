import type { HandoutConfig, GeneratedHandout } from "./handout-types";
import {
  generateHandoutHTML,
  wrapHTML,
  type HandoutRenderOptions,
} from "./handout-template";
import { generateQRDataURL } from "./qr-code";
import { ensureAbsoluteUrl } from "./utils";

export async function generateResourceQRs(
  config: HandoutConfig
): Promise<string[]> {
  return Promise.all(
    config.resourceLinks.slice(0, 3).map((link) =>
      generateQRDataURL(ensureAbsoluteUrl(link.url), {
        size: 200,
        logoScale: 0.2,
      })
    )
  );
}

export async function generateSingleHandoutHTML(
  config: HandoutConfig,
  creditUrl: string,
  index: number,
  defaultLogoSrc: string,
  resourceQRs?: string[],
  options?: HandoutRenderOptions
): Promise<string> {
  const qrs = resourceQRs ?? (await generateResourceQRs(config));
  const mainQR = await generateQRDataURL(creditUrl, { size: 400 });
  return generateHandoutHTML(
    config,
    creditUrl,
    index,
    mainQR,
    qrs,
    defaultLogoSrc,
    options
  );
}

export async function generateAllHandouts(
  config: HandoutConfig,
  creditUrls: string[],
  defaultLogoSrc: string,
  onProgress?: (current: number, total: number) => void
): Promise<GeneratedHandout[]> {
  const resourceQRs = await generateResourceQRs(config);
  const results: GeneratedHandout[] = [];

  for (let i = 0; i < creditUrls.length; i++) {
    const mainQR = await generateQRDataURL(creditUrls[i], 400);
    const html = generateHandoutHTML(
      config,
      creditUrls[i],
      i,
      mainQR,
      resourceQRs,
      defaultLogoSrc
    );
    results.push({ index: i, creditUrl: creditUrls[i], html });
    onProgress?.(i + 1, creditUrls.length);

    if (i % 10 === 9) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return results;
}

export async function generateFullDocumentHTML(
  config: HandoutConfig,
  creditUrls: string[],
  defaultLogoSrc: string,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  const handouts = await generateAllHandouts(
    config,
    creditUrls,
    defaultLogoSrc,
    onProgress
  );
  return wrapHTML(
    handouts.map((h) => h.html),
    `${config.eventName} — Credit Handouts`,
    config
  );
}

export { wrapHTML };
