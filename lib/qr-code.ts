import QRCode from "qrcode";

/** Compact app icon — works well as a QR center mark (light bg + dark hexagon). */
export const DEFAULT_QR_LOGO_SRC = "/APP_ICON_2D_LIGHT.png";

export interface QRGenerateOptions {
  size: number;
  /** Center logo path or data URL. Pass `null` to omit. */
  logoSrc?: string | null;
  /** Logo width as a fraction of the QR code width (default 0.22). */
  logoScale?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load QR logo: ${src}`));
    img.src = src;
  });
}

function drawLogoBackdrop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number
) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, size, size, radius);
  } else {
    ctx.rect(x, y, size, size);
  }
  ctx.fill();
}

/**
 * Generate a QR code data URL, optionally with a centered brand logo.
 * Uses high error correction when a logo is present so codes stay scannable.
 */
export async function generateQRDataURL(
  text: string,
  options: number | QRGenerateOptions
): Promise<string> {
  const opts: QRGenerateOptions =
    typeof options === "number" ? { size: options } : options;
  const { size, logoSrc = DEFAULT_QR_LOGO_SRC, logoScale = 0.22 } = opts;
  const hasLogo = Boolean(logoSrc);

  const canvas = await QRCode.toCanvas(text, {
    width: size,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: hasLogo ? "H" : "M",
  });

  if (hasLogo && logoSrc) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas.toDataURL("image/png");

    const img = await loadImage(logoSrc);
    const logoSize = size * logoScale;
    const pad = logoSize * 0.1;
    const box = logoSize + pad * 2;
    const x = (size - box) / 2;
    const y = (size - box) / 2;

    drawLogoBackdrop(ctx, x, y, box, box * 0.2);
    ctx.drawImage(img, x + pad, y + pad, logoSize, logoSize);
  }

  return canvas.toDataURL("image/png");
}
