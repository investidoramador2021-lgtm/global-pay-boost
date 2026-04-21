import { useTranslation } from "react-i18next";
import { Star, ExternalLink } from "lucide-react";

const TRUSTPILOT_REVIEW_URL = "https://www.trustpilot.com/evaluate/mrcglobalpay.com";

const TrustpilotInvite = () => {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-border bg-card/40 px-6 py-6 text-center backdrop-blur">
        <div className="flex items-center gap-1.5 text-[#00b67a]">
          <Star className="h-5 w-5 fill-current" />
          <span className="font-display text-sm font-semibold tracking-wide uppercase">
            {t("trustpilotInvite.eyebrow")}
          </span>
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
          {t("trustpilotInvite.heading")}
        </h2>
        <p className="max-w-md font-body text-sm text-muted-foreground">
          {t("trustpilotInvite.body")}
        </p>
        <a
          href={TRUSTPILOT_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#00b67a] px-5 py-2.5 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t("trustpilotInvite.cta")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
};

export default TrustpilotInvite;
