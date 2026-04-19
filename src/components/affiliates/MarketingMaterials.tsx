import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageIcon,
  Share2,
  Mail,
  Youtube,
  FileText,
  Copy,
  Check,
  Megaphone,
  Sparkles,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { bannerSpecs, createBannerDataUrl, downloadBanner } from "@/components/affiliates/bannerSvg";

/* ─────────── Shared helpers ─────────── */
const CopyBlock = ({ text, label }: { text: string; label?: string }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="relative">
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 pr-20 font-mono text-xs leading-relaxed text-foreground">
        {text}
      </pre>
      <Button
        size="sm"
        variant={copied ? "default" : "outline"}
        onClick={onCopy}
        className="absolute right-2 top-2 h-7 gap-1 text-[11px]"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? t("affiliates.materials.copied") : (label ?? t("affiliates.materials.copy"))}
      </Button>
    </div>
  );
};

/* ─────────── COMPONENT ─────────── */
const MarketingMaterials = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const dir = i18n.dir(lang) as "ltr" | "rtl";

  const banners = bannerSpecs.map((spec, index) => {
    const overlay = t(`affiliates.materials.banner${index + 1}Overlay`);
    return {
      ...spec,
      name: t(`affiliates.materials.banner${index + 1}Name`),
      size: `${spec.width} × ${spec.height}`,
      overlay,
      preview: createBannerDataUrl(spec, overlay, dir),
    };
  });

  const socials = [
    { platform: t("affiliates.social.platformX"), label: t("affiliates.social.x1Label"), text: t("affiliates.social.x1Text") },
    { platform: t("affiliates.social.platformX"), label: t("affiliates.social.x2Label"), text: t("affiliates.social.x2Text") },
    { platform: t("affiliates.social.platformTelegram"), label: t("affiliates.social.tg1Label"), text: t("affiliates.social.tg1Text") },
    { platform: t("affiliates.social.platformTelegram"), label: t("affiliates.social.tg2Label"), text: t("affiliates.social.tg2Text") },
    { platform: t("affiliates.social.platformLinkedin"), label: t("affiliates.social.liLabel"), text: t("affiliates.social.liText") },
    { platform: t("affiliates.social.platformInstagram"), label: t("affiliates.social.igLabel"), text: t("affiliates.social.igText") },
  ];

  const emails = [
    { label: t("affiliates.emails.e1Label"), text: t("affiliates.emails.e1Text") },
    { label: t("affiliates.emails.e2Label"), text: t("affiliates.emails.e2Text") },
    { label: t("affiliates.emails.e3Label"), text: t("affiliates.emails.e3Text") },
  ];

  const videoScript = t("affiliates.video.script");
  const blogPost = t("affiliates.blog.post");

  return (
    <section
      id="marketing-materials"
      className="border-b border-border bg-background py-16 sm:py-20"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
            <Megaphone className="h-3 w-3" /> {t("affiliates.materials.badge")}
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
            {t("affiliates.materials.title")}
          </h2>
          <p className="mt-3 font-body text-muted-foreground leading-relaxed">
            {t("affiliates.materials.subtitle1")}{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">[YOUR-AFFILIATE-LINK]</code>{" "}
            {t("affiliates.materials.subtitle2")}
          </p>
        </div>

        <div className="mt-10">
          <Tabs defaultValue="banners" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
              <TabsTrigger value="banners" className="gap-1.5 text-xs">
                <ImageIcon className="h-3.5 w-3.5" /> {t("affiliates.materials.tabBanners")}
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-1.5 text-xs">
                <Share2 className="h-3.5 w-3.5" /> {t("affiliates.materials.tabSocial")}
              </TabsTrigger>
              <TabsTrigger value="emails" className="gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5" /> {t("affiliates.materials.tabEmails")}
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-1.5 text-xs">
                <Youtube className="h-3.5 w-3.5" /> {t("affiliates.materials.tabVideo")}
              </TabsTrigger>
              <TabsTrigger value="blog" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> {t("affiliates.materials.tabBlog")}
              </TabsTrigger>
            </TabsList>

            {/* ─────────── BANNERS ─────────── */}
            <TabsContent value="banners" className="mt-8">
              <p className="mb-6 text-center text-sm text-muted-foreground">
                {t("affiliates.materials.bannersHeader")}
              </p>
              <div className="grid gap-5 lg:grid-cols-2">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {b.name}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          b.theme === "Dark"
                            ? "bg-foreground/10 text-foreground"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {b.theme === "Dark" ? t("affiliates.materials.themeDark") : t("affiliates.materials.themeLight")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("affiliates.materials.size")}: <span className="font-mono">{b.size}</span>
                    </p>

                    <div
                      className={cn(
                        "mt-3 overflow-hidden rounded-lg border border-border bg-muted/40",
                        b.aspect,
                      )}
                    >
                      <img
                        src={b.preview}
                        alt={`${b.name} — ${b.overlay}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => downloadBanner(b, b.overlay, lang, dir)}
                      className="mt-3 inline-flex h-auto w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 font-display text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      <Download className="h-3.5 w-3.5" /> {t("affiliates.materials.download")}
                    </Button>

                    <div className="mt-3">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("affiliates.materials.suggestedOverlay")}
                      </p>
                      <CopyBlock text={b.overlay} label={t("affiliates.materials.copyText")} />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ─────────── SOCIAL ─────────── */}
            <TabsContent value="social" className="mt-8">
              <p className="mb-6 text-center text-sm text-muted-foreground">
                {t("affiliates.materials.socialHeader1")}{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">[YOUR-AFFILIATE-LINK]</code>{" "}
                {t("affiliates.materials.socialHeader2")}
              </p>
              <div className="grid gap-5 lg:grid-cols-2">
                {socials.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {s.label}
                      </h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {s.platform}
                      </span>
                    </div>
                    <div className="mt-3">
                      <CopyBlock text={s.text} label={t("affiliates.materials.copyPost")} />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ─────────── EMAILS ─────────── */}
            <TabsContent value="emails" className="mt-8">
              <p className="mb-6 text-center text-sm text-muted-foreground">
                {t("affiliates.materials.emailsHeader")}
              </p>
              <div className="grid gap-5">
                {emails.map((e) => (
                  <div
                    key={e.label}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {e.label}
                    </h3>
                    <div className="mt-3">
                      <CopyBlock text={e.text} label={t("affiliates.materials.copyEmail")} />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ─────────── VIDEO ─────────── */}
            <TabsContent value="video" className="mt-8">
              <p className="mb-6 text-center text-sm text-muted-foreground">
                {t("affiliates.materials.videoHeader")}
              </p>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {t("affiliates.materials.videoTitle")}
                  </h3>
                </div>
                <div className="mt-3">
                  <CopyBlock text={videoScript} label={t("affiliates.materials.copyScript")} />
                </div>
              </div>
            </TabsContent>

            {/* ─────────── BLOG ─────────── */}
            <TabsContent value="blog" className="mt-8">
              <p className="mb-6 text-center text-sm text-muted-foreground">
                {t("affiliates.materials.blogHeader")}
              </p>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {t("affiliates.materials.blogTitle")}
                  </h3>
                </div>
                <div className="mt-3">
                  <CopyBlock text={blogPost} label={t("affiliates.materials.copyArticle")} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            <strong className="text-foreground">{t("affiliates.materials.proTipLabel")}</strong>{" "}
            {t("affiliates.materials.proTip")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default MarketingMaterials;
