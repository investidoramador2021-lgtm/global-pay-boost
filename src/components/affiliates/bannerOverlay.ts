import banner1 from "@/assets/affiliate-banner-1-leaderboard.jpg";
import banner2 from "@/assets/affiliate-banner-2-mediumrect-dark.jpg";
import banner3 from "@/assets/affiliate-banner-3-mediumrect-light.jpg";
import banner4 from "@/assets/affiliate-banner-4-skyscraper.jpg";
import banner5 from "@/assets/affiliate-banner-5-social.jpg";
import banner6 from "@/assets/affiliate-banner-6-story.jpg";

export type BannerTheme = "dark" | "light";

export interface BannerSpec {
  id: string;
  image: string;
  width: number;
  height: number;
  theme: BannerTheme;
  filename: string;
  aspect: string;
  /** 0..1 box where the localized headline should sit on top of the source JPG */
  textBox: { x: number; y: number; w: number; h: number };
  /** Text alignment inside the textBox */
  align?: "left" | "center";
}

export const bannerSpecs: BannerSpec[] = [
  {
    id: "leaderboard",
    image: banner1,
    width: 1920,
    height: 1080,
    theme: "dark",
    filename: "mrcglobalpay-banner-leaderboard",
    aspect: "aspect-[16/9]",
    textBox: { x: 0.06, y: 0.32, w: 0.62, h: 0.4 },
    align: "left",
  },
  {
    id: "medium-rect-dark",
    image: banner2,
    width: 1024,
    height: 1024,
    theme: "dark",
    filename: "mrcglobalpay-banner-mediumrect-dark",
    aspect: "aspect-square",
    textBox: { x: 0.08, y: 0.34, w: 0.84, h: 0.36 },
    align: "center",
  },
  {
    id: "medium-rect-light",
    image: banner3,
    width: 1024,
    height: 1024,
    theme: "light",
    filename: "mrcglobalpay-banner-mediumrect-light",
    aspect: "aspect-square",
    textBox: { x: 0.08, y: 0.34, w: 0.84, h: 0.36 },
    align: "center",
  },
  {
    id: "skyscraper",
    image: banner4,
    width: 1080,
    height: 1920,
    theme: "dark",
    filename: "mrcglobalpay-banner-skyscraper",
    aspect: "aspect-[9/16]",
    textBox: { x: 0.08, y: 0.4, w: 0.84, h: 0.34 },
    align: "center",
  },
  {
    id: "social-1200",
    image: banner5,
    width: 1200,
    height: 628,
    theme: "dark",
    filename: "mrcglobalpay-banner-social",
    aspect: "aspect-[1200/628]",
    textBox: { x: 0.07, y: 0.32, w: 0.62, h: 0.4 },
    align: "left",
  },
  {
    id: "story-1080",
    image: banner6,
    width: 1080,
    height: 1920,
    theme: "dark",
    filename: "mrcglobalpay-banner-story",
    aspect: "aspect-[9/16]",
    textBox: { x: 0.08, y: 0.42, w: 0.84, h: 0.32 },
    align: "center",
  },
];

/* ─── Image cache so we don't decode the JPG every render ─── */
const imageCache = new Map<string, Promise<HTMLImageElement>>();

const loadImage = (src: string) => {
  if (!imageCache.has(src)) {
    imageCache.set(
      src,
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      }),
    );
  }
  return imageCache.get(src)!;
};

/* ─── Word wrapping that auto-fits the textBox ─── */
const wrapLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) => {
  const compact = text.trim().replace(/\s+/g, " ");
  const hasSpaces = /\s/.test(compact);
  const units = hasSpaces ? compact.split(" ") : Array.from(compact);
  const sep = hasSpaces ? " " : "";
  const lines: string[] = [];
  let current = "";

  for (const unit of units) {
    const candidate = current ? `${current}${sep}${unit}` : unit;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = unit;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const fitText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  boxW: number,
  boxH: number,
  fontFamily: string,
) => {
  let lo = 18;
  let hi = Math.floor(boxH * 0.55);
  let bestSize = lo;
  let bestLines: string[] = [text];

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    ctx.font = `800 ${mid}px ${fontFamily}`;
    const lines = wrapLines(ctx, text, boxW);
    const totalH = lines.length * mid * 1.12;
    if (totalH <= boxH && lines.every((line) => ctx.measureText(line).width <= boxW)) {
      bestSize = mid;
      bestLines = lines;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return { fontSize: bestSize, lines: bestLines };
};

export interface RenderOptions {
  spec: BannerSpec;
  text: string;
  dir?: "ltr" | "rtl";
  fontFamily?: string;
}

export const renderBannerCanvas = async ({
  spec,
  text,
  dir = "ltr",
  fontFamily = "'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif",
}: RenderOptions): Promise<HTMLCanvasElement> => {
  const img = await loadImage(spec.image);
  const canvas = document.createElement("canvas");
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext("2d")!;

  // 1. paint the source banner (object-cover style)
  const srcAspect = img.naturalWidth / img.naturalHeight;
  const dstAspect = spec.width / spec.height;
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  if (srcAspect > dstAspect) {
    sw = img.naturalHeight * dstAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / dstAspect;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, spec.width, spec.height);

  // 2. compute the text box in pixels
  const boxX = spec.textBox.x * spec.width;
  const boxY = spec.textBox.y * spec.height;
  const boxW = spec.textBox.w * spec.width;
  const boxH = spec.textBox.h * spec.height;

  // 3. paint a soft scrim behind the text so any language stays readable
  const scrimPad = Math.min(spec.width, spec.height) * 0.025;
  const scrimX = Math.max(0, boxX - scrimPad);
  const scrimY = Math.max(0, boxY - scrimPad);
  const scrimW = Math.min(spec.width - scrimX, boxW + scrimPad * 2);
  const scrimH = Math.min(spec.height - scrimY, boxH + scrimPad * 2);
  const radius = Math.min(spec.width, spec.height) * 0.035;

  const isLight = spec.theme === "light";
  ctx.save();
  ctx.beginPath();
  const r = Math.min(radius, scrimW / 2, scrimH / 2);
  ctx.moveTo(scrimX + r, scrimY);
  ctx.arcTo(scrimX + scrimW, scrimY, scrimX + scrimW, scrimY + scrimH, r);
  ctx.arcTo(scrimX + scrimW, scrimY + scrimH, scrimX, scrimY + scrimH, r);
  ctx.arcTo(scrimX, scrimY + scrimH, scrimX, scrimY, r);
  ctx.arcTo(scrimX, scrimY, scrimX + scrimW, scrimY, r);
  ctx.closePath();
  ctx.fillStyle = isLight ? "rgba(255,255,255,0.78)" : "rgba(7,16,29,0.55)";
  ctx.fill();
  ctx.restore();

  // 4. fit + wrap text
  const { fontSize, lines } = fitText(ctx, text, boxW, boxH, fontFamily);
  ctx.font = `800 ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.direction = dir;
  ctx.fillStyle = isLight ? "#0b1729" : "#ffffff";
  ctx.shadowColor = isLight ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
  ctx.shadowBlur = fontSize * 0.18;
  ctx.shadowOffsetY = Math.max(2, fontSize * 0.04);

  const lineHeight = fontSize * 1.12;
  const totalH = lines.length * lineHeight;
  const startY = boxY + boxH / 2 - totalH / 2 + lineHeight / 2;

  const align = spec.align ?? "center";
  ctx.textAlign = align === "left" ? (dir === "rtl" ? "right" : "left") : "center";
  const textX =
    align === "left"
      ? dir === "rtl"
        ? boxX + boxW
        : boxX
      : boxX + boxW / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, textX, startY + index * lineHeight);
  });

  return canvas;
};

export const renderBannerDataUrl = async (options: RenderOptions) => {
  const canvas = await renderBannerCanvas(options);
  return canvas.toDataURL("image/jpeg", 0.92);
};

export const downloadBanner = async (
  options: RenderOptions & { lang: string },
) => {
  const canvas = await renderBannerCanvas(options);
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Banner render failed"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${options.spec.filename}-${options.lang}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        resolve();
      },
      "image/jpeg",
      0.92,
    );
  });
};