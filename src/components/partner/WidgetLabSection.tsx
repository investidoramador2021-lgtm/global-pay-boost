import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, Code2, Palette, Globe, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

const OBS = {
  bg: "#0B0D10",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(192,192,192,0.12)",
  text: "#E8E8E8",
  muted: "#6B7280",
  accent: "#3B82F6",
  success: "#22D3EE",
} as const;

const THEMES = [
  { id: "obsidian", label: "Obsidian", color: "#0B0D10" },
  { id: "white", label: "Electric White", color: "#FFFFFF" },
] as const;

const PAIRS = [
  { from: "btc", to: "usdt", label: "BTC → USDT" },
  { from: "eth", to: "usdt", label: "ETH → USDT" },
  { from: "sol", to: "usdc", label: "SOL → USDC" },
  { from: "btc", to: "eth", label: "BTC → ETH" },
  { from: "usdt", to: "btc", label: "USDT → BTC" },
  { from: "xrp", to: "usdt", label: "XRP → USDT" },
] as const;

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ja", label: "日本語" },
  { code: "hi", label: "हिन्दी" },
  { code: "tr", label: "Türkçe" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "uk", label: "Українська" },
  { code: "af", label: "Afrikaans" },
  { code: "he", label: "עברית" },
  { code: "fa", label: "فارسی" },
  { code: "ur", label: "اردو" },
] as const;

const SIZES = [
  { label: "Compact", w: 360, h: 440 },
  { label: "Standard", w: 420, h: 460 },
  { label: "Wide", w: 520, h: 480 },
] as const;

interface Props {
  referralCode: string;
  partnerId: string;
}

export default function WidgetLabSection({ referralCode, partnerId }: Props) {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<string>("obsidian");
  const [pairIdx, setPairIdx] = useState(0);
  const [langIdx, setLangIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [copied, setCopied] = useState(false);
  const [outputMode, setOutputMode] = useState<"iframe" | "react">("iframe");

  const pair = PAIRS[pairIdx];
  const lang = LANGUAGES[langIdx];
  const size = SIZES[sizeIdx];

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      ref: referralCode,
      from: pair.from,
      to: pair.to,
      lang: lang.code,
      theme: theme,
      source: "widget",
    });
    return `https://mrcglobalpay.com/embed/widget?${params.toString()}`;
  }, [referralCode, pair, lang, theme]);

  const iframeCode = `<iframe src="${iframeSrc}" width="${size.w}" height="${size.h}" style="border:none;border-radius:16px;overflow:hidden;" allow="clipboard-write" loading="lazy" title="MRC Global Pay Crypto Swap Widget"></iframe>`;

  const reactCode = `import React from "react";

const MRCSwapWidget = () => (
  <iframe
    src="${iframeSrc}"
    width={${size.w}}
    height={${size.h}}
    style={{ border: "none", borderRadius: 16, overflow: "hidden" }}
    allow="clipboard-write"
    loading="lazy"
    title="MRC Global Pay Crypto Swap Widget"
  />
);

export default MRCSwapWidget;`;

  const embedCode = outputMode === "iframe" ? iframeCode : reactCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Configurator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-5">
          {/* Theme */}
          <div className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4" style={{ color: OBS.accent }} />
              <span className="text-xs uppercase tracking-wider font-medium" style={{ color: OBS.muted }}>
                {t("portal.widgetTheme", "Theme")}
              </span>
            </div>
            <div className="flex gap-2">
              {THEMES.map(th => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: theme === th.id ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                    border: `0.5px solid ${theme === th.id ? OBS.accent : OBS.border}`,
                    color: theme === th.id ? OBS.accent : OBS.muted,
                  }}
                >
                  <div className="w-4 h-4 rounded-full border" style={{ background: th.color, borderColor: OBS.border }} />
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Pair */}
          <div className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4" style={{ color: OBS.accent }} />
              <span className="text-xs uppercase tracking-wider font-medium" style={{ color: OBS.muted }}>
                {t("portal.widgetDefaultPair", "Default Pair")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PAIRS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setPairIdx(i)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all"
                  style={{
                    background: pairIdx === i ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                    border: `0.5px solid ${pairIdx === i ? OBS.accent : OBS.border}`,
                    color: pairIdx === i ? OBS.accent : OBS.muted,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4" style={{ color: OBS.accent }} />
              <span className="text-xs uppercase tracking-wider font-medium" style={{ color: OBS.muted }}>
                {t("portal.widgetLanguage", "Language")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l, i) => (
                <button
                  key={l.code}
                  onClick={() => setLangIdx(i)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: langIdx === i ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                    border: `0.5px solid ${langIdx === i ? OBS.accent : OBS.border}`,
                    color: langIdx === i ? OBS.accent : OBS.muted,
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4" style={{ color: OBS.accent }} />
              <span className="text-xs uppercase tracking-wider font-medium" style={{ color: OBS.muted }}>
                {t("portal.widgetSize", "Size")}
              </span>
            </div>
            <div className="flex gap-2">
              {SIZES.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSizeIdx(i)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: sizeIdx === i ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                    border: `0.5px solid ${sizeIdx === i ? OBS.accent : OBS.border}`,
                    color: sizeIdx === i ? OBS.accent : OBS.muted,
                  }}
                >
                  {s.label} ({s.w}×{s.h})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: OBS.muted }}>
            {t("portal.widgetPreview", "Live Preview")}
          </span>
          <div
            className="rounded-2xl p-4 flex items-center justify-center"
            style={{
              background: theme === "white" ? "#F1F5F9" : "rgba(255,255,255,0.02)",
              border: `0.5px solid ${OBS.border}`,
              minHeight: size.h + 40,
            }}
          >
            <iframe
              src={`/embed/widget?ref=${referralCode}&from=${pair.from}&to=${pair.to}&lang=${lang.code}&theme=${theme}&source=widget`}
              width={Math.min(size.w, 400)}
              height={size.h}
              style={{ border: "none", borderRadius: 16, overflow: "hidden", maxWidth: "100%" }}
              allow="clipboard-write"
              title="Widget Preview"
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs" style={{ color: OBS.muted }}>
              ref={referralCode} · source=widget · 0.4% commission
            </span>
          </div>
        </div>
      </div>

      {/* Code Output */}
      <div className="rounded-xl p-5" style={{ background: OBS.card, border: `0.5px solid ${OBS.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4" style={{ color: OBS.accent }} />
            <span className="text-sm font-medium" style={{ color: OBS.text }}>
              {t("portal.widgetEmbedCode", "Embed Code")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: `0.5px solid ${OBS.border}` }}>
              {(["iframe", "react"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setOutputMode(mode)}
                  className="px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: outputMode === mode ? "rgba(59,130,246,0.15)" : "transparent",
                    color: outputMode === mode ? OBS.accent : OBS.muted,
                  }}
                >
                  {mode === "iframe" ? "HTML" : "React"}
                </button>
              ))}
            </div>
            <Button
              onClick={handleCopy}
              size="sm"
              className="h-8 text-xs font-medium"
              style={{
                background: copied ? "rgba(34,211,238,0.15)" : "rgba(59,130,246,0.15)",
                color: copied ? OBS.success : OBS.accent,
                border: `0.5px solid ${copied ? OBS.success : OBS.accent}`,
              }}
            >
              {copied ? <Check className="w-3.5 h-3.5 me-1" /> : <Copy className="w-3.5 h-3.5 me-1" />}
              {copied ? t("portal.copied", "Copied!") : t("portal.copyCode", "Copy Code")}
            </Button>
          </div>
        </div>
        <pre
          className="overflow-x-auto p-4 rounded-lg text-xs leading-relaxed whitespace-pre-wrap break-all font-mono"
          style={{ background: "#050507", color: "#93C5FD", border: `0.5px solid ${OBS.border}` }}
        >
          <code>{embedCode}</code>
        </pre>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: OBS.success }} />
            <span className="text-[11px]" style={{ color: OBS.muted }}>partner_id baked in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: OBS.success }} />
            <span className="text-[11px]" style={{ color: OBS.muted }}>0.4% commission auto-tracked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: OBS.success }} />
            <span className="text-[11px]" style={{ color: OBS.muted }}>source=widget analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
