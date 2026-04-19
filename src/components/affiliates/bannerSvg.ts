export type BannerTheme = "dark" | "light";

export interface BannerSpec {
  id: string;
  width: number;
  height: number;
  theme: BannerTheme;
  filename: string;
  aspect: string;
}

export const bannerSpecs: BannerSpec[] = [
  { id: "leaderboard", width: 1920, height: 1080, theme: "dark", filename: "mrcglobalpay-banner-leaderboard", aspect: "aspect-[16/9]" },
  { id: "medium-rect-dark", width: 1024, height: 1024, theme: "dark", filename: "mrcglobalpay-banner-mediumrect-dark", aspect: "aspect-square" },
  { id: "medium-rect-light", width: 1024, height: 1024, theme: "light", filename: "mrcglobalpay-banner-mediumrect-light", aspect: "aspect-square" },
  { id: "skyscraper", width: 1080, height: 1920, theme: "dark", filename: "mrcglobalpay-banner-skyscraper", aspect: "aspect-[9/16]" },
  { id: "social-1200", width: 1200, height: 628, theme: "dark", filename: "mrcglobalpay-banner-social", aspect: "aspect-[1200/628]" },
  { id: "story-1080", width: 1080, height: 1920, theme: "dark", filename: "mrcglobalpay-banner-story", aspect: "aspect-[9/16]" },
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const wrapText = (text: string, maxChars: number, maxLines = 4) => {
  const compact = text.trim().replace(/\s+/g, " ");
  if (!compact) return [];

  const units = compact.includes(" ") ? compact.split(" ") : Array.from(compact);
  const lines: string[] = [];
  let current = "";

  for (const unit of units) {
    const next = current
      ? compact.includes(" ")
        ? `${current} ${unit}`
        : `${current}${unit}`
      : unit;

    if (next.length <= maxChars || !current) {
      current = next;
      continue;
    }

    lines.push(current);
    current = unit;
  }

  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;

  const trimmed = lines.slice(0, maxLines);
  trimmed[maxLines - 1] = `${trimmed.slice(maxLines - 1).join(compact.includes(" ") ? " " : "")}`;
  return trimmed;
};

const paletteFor = (theme: BannerTheme) =>
  theme === "light"
    ? {
        backgroundA: "hsl(210 35% 98%)",
        backgroundB: "hsl(198 42% 94%)",
        backgroundC: "hsl(213 36% 86%)",
        panelFill: "rgba(255,255,255,0.72)",
        panelStroke: "rgba(15,23,42,0.12)",
        eyebrowFill: "rgba(255,255,255,0.82)",
        text: "#07131f",
        muted: "rgba(7,19,31,0.72)",
        glow: "rgba(0,230,118,0.35)",
        accent: "#00C853",
      }
    : {
        backgroundA: "hsl(225 57% 10%)",
        backgroundB: "hsl(216 65% 8%)",
        backgroundC: "hsl(167 72% 17%)",
        panelFill: "rgba(255,255,255,0.10)",
        panelStroke: "rgba(255,255,255,0.26)",
        eyebrowFill: "rgba(15,23,42,0.52)",
        text: "#ffffff",
        muted: "rgba(255,255,255,0.82)",
        glow: "rgba(0,230,118,0.42)",
        accent: "#00E676",
      };

const buildSvg = (spec: BannerSpec, overlay: string, dir: "ltr" | "rtl") => {
  const palette = paletteFor(spec.theme);
  const isTall = spec.height > spec.width;
  const lines = wrapText(overlay, isTall ? 14 : spec.width >= 1600 ? 24 : 20, isTall ? 5 : 4);
  const panelX = spec.width * (isTall ? 0.08 : 0.09);
  const panelY = spec.height * (isTall ? 0.28 : 0.31);
  const panelW = spec.width * (isTall ? 0.84 : 0.82);
  const panelH = spec.height * (isTall ? 0.5 : 0.38);
  const baseFontSize = isTall ? 92 : spec.width >= 1500 ? 112 : 86;
  const fontSize = Math.max(40, baseFontSize - Math.max(0, lines.length - 2) * 12);
  const lineHeight = fontSize * 1.08;
  const textBlockHeight = lineHeight * Math.max(lines.length, 1);
  const startY = panelY + panelH / 2 - textBlockHeight / 2 + fontSize * 0.8;
  const textX = panelX + panelW / 2;

  const textLines = lines
    .map(
      (line, index) => `<text x="${textX}" y="${startY + index * lineHeight}" fill="${palette.text}" font-size="${fontSize}" font-weight="800" text-anchor="middle" direction="${dir}" unicode-bidi="plaintext" font-family="Inter, Arial, sans-serif">${escapeXml(line)}</text>`,
    )
    .join("");

  const brandSize = isTall ? 54 : 42;
  const subBrandSize = isTall ? 26 : 20;
  const coinRadius = isTall ? 96 : 62;
  const coinOffsetX = isTall ? spec.width * 0.73 : spec.width * 0.8;
  const coinOffsetY = isTall ? spec.height * 0.22 : spec.height * 0.39;
  const ethOffsetX = isTall ? spec.width * 0.78 : spec.width * 0.88;
  const ethOffsetY = isTall ? spec.height * 0.36 : spec.height * 0.48;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${spec.width}" height="${spec.height}" viewBox="0 0 ${spec.width} ${spec.height}" role="img" aria-label="MRC GlobalPay banner">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette.backgroundA}" />
        <stop offset="52%" stop-color="${palette.backgroundB}" />
        <stop offset="100%" stop-color="${palette.backgroundC}" />
      </linearGradient>
      <radialGradient id="glowA" cx="20%" cy="85%" r="45%">
        <stop offset="0%" stop-color="${palette.glow}" />
        <stop offset="100%" stop-color="rgba(0,230,118,0)" />
      </radialGradient>
      <radialGradient id="glowB" cx="85%" cy="25%" r="30%">
        <stop offset="0%" stop-color="rgba(255,214,10,0.28)" />
        <stop offset="100%" stop-color="rgba(255,214,10,0)" />
      </radialGradient>
      <filter id="blur-xl"><feGaussianBlur stdDeviation="28" /></filter>
      <filter id="shadow-lg" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="28" flood-color="rgba(0,0,0,0.24)" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)" rx="${Math.min(spec.width, spec.height) * 0.04}" />
    <circle cx="${spec.width * 0.18}" cy="${spec.height * 0.82}" r="${spec.width * 0.2}" fill="url(#glowA)" filter="url(#blur-xl)" />
    <circle cx="${spec.width * 0.84}" cy="${spec.height * 0.18}" r="${spec.width * 0.11}" fill="url(#glowB)" filter="url(#blur-xl)" />
    <g opacity="0.12" stroke="rgba(255,255,255,0.18)" fill="none">
      <path d="M ${spec.width * 0.08} ${spec.height * 0.78} C ${spec.width * 0.25} ${spec.height * 0.55}, ${spec.width * 0.52} ${spec.height * 0.95}, ${spec.width * 0.72} ${spec.height * 0.7}" stroke-width="3" />
      <path d="M ${spec.width * 0.64} ${spec.height * 0.18} C ${spec.width * 0.78} ${spec.height * 0.26}, ${spec.width * 0.94} ${spec.height * 0.34}, ${spec.width * 0.96} ${spec.height * 0.52}" stroke-width="3" />
    </g>
    <g opacity="0.14" stroke="rgba(255,255,255,0.1)">
      ${Array.from({ length: 8 }).map((_, index) => `<line x1="${spec.width * (0.08 + index * 0.1)}" y1="${spec.height * 0.58}" x2="${spec.width * (0.08 + index * 0.1)}" y2="${spec.height * 0.86}" />`).join("")}
    </g>
    <g filter="url(#shadow-lg)">
      <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="${Math.min(spec.width, spec.height) * 0.035}" fill="${palette.panelFill}" stroke="${palette.panelStroke}" stroke-width="3" />
    </g>
    <rect x="${spec.width * 0.05}" y="${spec.height * 0.06}" width="${isTall ? spec.width * 0.25 : spec.width * 0.13}" height="${isTall ? spec.height * 0.09 : spec.height * 0.16}" rx="${Math.min(spec.width, spec.height) * 0.025}" fill="${palette.eyebrowFill}" stroke="${palette.panelStroke}" />
    <text x="${spec.width * 0.075}" y="${spec.height * 0.125}" fill="${palette.text}" font-size="${brandSize}" font-weight="800" font-family="Inter, Arial, sans-serif">MRC</text>
    <text x="${spec.width * 0.075}" y="${spec.height * 0.125 + subBrandSize + 10}" fill="${palette.muted}" font-size="${subBrandSize}" font-weight="700" font-family="Inter, Arial, sans-serif">GLOBAL PAY</text>
    <circle cx="${coinOffsetX}" cy="${coinOffsetY}" r="${coinRadius}" fill="rgba(255,196,0,0.18)" stroke="rgba(255,215,0,0.45)" stroke-width="4" />
    <text x="${coinOffsetX}" y="${coinOffsetY + coinRadius * 0.24}" fill="#FFD54F" font-size="${coinRadius}" font-weight="800" text-anchor="middle" font-family="Inter, Arial, sans-serif">₿</text>
    <circle cx="${ethOffsetX}" cy="${ethOffsetY}" r="${coinRadius * 0.82}" fill="rgba(226,232,240,0.18)" stroke="rgba(226,232,240,0.5)" stroke-width="4" />
    <text x="${ethOffsetX}" y="${ethOffsetY + coinRadius * 0.18}" fill="#E2E8F0" font-size="${coinRadius * 0.8}" font-weight="800" text-anchor="middle" font-family="Inter, Arial, sans-serif">Ξ</text>
    <text x="${spec.width * 0.86}" y="${spec.height * 0.78}" fill="${palette.accent}" font-size="${isTall ? 120 : 96}" font-weight="800" text-anchor="middle" font-family="Inter, Arial, sans-serif">→</text>
    ${textLines}
  </svg>`;
};

export const createBannerDataUrl = (spec: BannerSpec, overlay: string, dir: "ltr" | "rtl") =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildSvg(spec, overlay, dir))}`;

export const downloadBanner = (spec: BannerSpec, overlay: string, lang: string, dir: "ltr" | "rtl") => {
  const blob = new Blob([buildSvg(spec, overlay, dir)], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${spec.filename}-${lang}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};