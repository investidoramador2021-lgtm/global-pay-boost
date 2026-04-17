import { Helmet } from "react-helmet-async";
import { ShieldCheck, Sparkles, Zap, Wallet, ExternalLink, Coins } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ExchangeWidget from "@/components/ExchangeWidget";

const FINTRAC_URL =
  "https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search/search-by-name/";
const PAGE_URL = "https://mrcglobalpay.com/tr/turkiye";

const TurkeyHub = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://mrcglobalpay.com#org",
        name: "MRC GlobalPay",
        alternateName: "MRC GlobalPay Türkiye",
        url: "https://mrcglobalpay.com",
        logo: "https://mrcglobalpay.com/icon-512.png",
      },
      {
        "@type": "FinancialService",
        "@id": `${PAGE_URL}#service`,
        name: "MRC GlobalPay — Türkiye Hub",
        url: PAGE_URL,
        areaServed: "TR",
        knowsLanguage: "tr",
        inLanguage: "tr",
        knowsAbout: [
          "Tether Gold (XAUt)",
          "PAX Gold (PAXG)",
          "Hyperliquid (HYPE)",
          "Saklamasız kripto borsa",
          "Non-custodial crypto exchange",
          "Lira hedging",
          "Türkiye 2026 kripto vergisi",
        ],
        provider: { "@id": "https://mrcglobalpay.com#org" },
        serviceType: "Non-custodial crypto exchange",
        currenciesAccepted: "TRY, XAUt, PAXG, HYPE, BTC, ETH, USDT, USDC",
        identifier: {
          "@type": "PropertyValue",
          propertyID: "FINTRAC MSB",
          value: "C100000015",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Türkiye'den XAUt (Tether Gold) nasıl alınır?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "MRC GlobalPay üzerinden USDT'nizi doğrudan XAUt'a (1 XAUt = 1 troy ons fiziksel altın) saklamasız olarak takas edebilirsiniz. KYC gerekmez, cüzdandan cüzdana, 60 saniyede tamamlanır.",
            },
          },
          {
            "@type": "Question",
            name: "MRC GlobalPay Türk lirası enflasyonuna karşı nasıl koruma sağlar?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Anında XAUt veya PAXG (fiziksel altınla %100 desteklenen tokenler) alarak servetinizi G7 standartlarında bir saklayıcıya bağlayabilirsiniz — Lira değer kaybetse bile altın değerini korur.",
            },
          },
          {
            "@type": "Question",
            name: "2026 Türkiye %10 kripto vergisi otomatik takas yapımı nasıl etkiler?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Saklamasız (non-custodial) takaslar bireysel kayıt zorunluluğu doğurur. MRC GlobalPay, her işlem için on-chain TXID ve tarih bilgisi sağlar — yıllık vergi beyanı için doğrudan dışa aktarılabilir.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MRC Türkiye — Saklamasız XAUt, HYPE & Altın Takası | MRC GlobalPay</title>
        <meta
          name="description"
          content="Türkiye için saklamasız kripto takas hub'ı: USDT → XAUt (Tether Gold), HYPE ve PAXG. Lira enflasyonuna karşı G7 standardında koruma. FINTRAC MSB #C100000015."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content="MRC Türkiye — XAUt & HYPE Saklamasız Takas" />
        <meta property="og:locale" content="tr_TR" />
        <meta name="keywords" content="XAUt Türkiye, Tether Gold satın al, HYPE Türkiye, saklamasız kripto borsa, lira enflasyon koruma, 2026 kripto vergisi" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="container mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-trust/30 bg-trust/[0.06] px-3 py-1 text-xs font-medium text-trust">
            <ShieldCheck className="h-3.5 w-3.5" />
            G7 Standardı · FINTRAC MSB Kanada #C100000015
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            MRC Türkiye: Lira'dan fiziksel altına saklamasız köprü
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            <strong className="text-foreground">USDT → XAUt</strong> (Tether Gold), <strong className="text-foreground">HYPE</strong> ve <strong className="text-foreground">PAXG</strong> takasları $0.30'dan başlar. KYC yok, ön ödeme yok — Lira enflasyonuna karşı doğrudan cüzdanınıza altın.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,420px]">
            <div className="space-y-4">
              {/* Gold-hedging case study */}
              <div className="rounded-2xl border border-border bg-card/60 p-5">
                <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <Coins className="h-4 w-4 text-primary" />
                  Neden MRC üzerinden altın? Yerel borsa yerine saklamasız hedge
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Türk lirası 2024-2026 döneminde rekor enflasyon yaşadı. Yerli yatırımcılar fiziksel altına yöneldi, ancak fiziksel saklama ve kuyumcu komisyonları %3-5 maliyet ekliyor. <strong className="text-foreground">XAUt (Tether Gold)</strong> ve <strong className="text-foreground">PAXG (PAX Gold)</strong>, her token başına 1 troy ons fiziksel altınla %100 desteklenir — Londra ve İsviçre kasalarında saklanır.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  MRC GlobalPay, USDT'nizi doğrudan XAUt'a saklamasız olarak takas eder: işlemler 60 saniye, FINTRAC MSB lisansı (#C100000015) ile G7 düzeyinde uyumluluk, ve cüzdanınız ile borsamız arasında <strong className="text-foreground">hiçbir aracı saklayıcı yok</strong>. Yerli borsalar gibi para çekimde gecikme veya günlük limit yok.
                </p>
              </div>

              {/* 2026 Tax block — Turkey-only */}
              <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-5">
                <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  2026 %10 kripto vergisi: MRC'de otomatik kayıt
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Türkiye'nin yeni 2026 vergi düzenlemesi her kripto takası için %10 stopaj öngörüyor. Saklamasız platformlarda bu sorumluluk bireye düşer — fakat MRC GlobalPay her işlem için on-chain TXID, tarih ve fiyat verisi sağlar. Yıl sonunda CSV/PDF olarak dışa aktarılabilir.
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    Her takasta otomatik TXID + zaman damgası
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    G7 standardında uyumluluk (FINTRAC denetimli)
                  </li>
                </ul>
                <a
                  href={FINTRAC_URL}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  FINTRAC #C100000015 lisansını doğrula
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Widget — defaults to USDT → XAUt for gold-hedging */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ExchangeWidget defaultFrom="usdt" defaultTo="xaut" />
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Varsayılan: USDT → XAUt · ayrıca PAXG ve HYPE desteklenir
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Guides — Topic Cluster */}
      <section className="border-b border-border">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
            Hızlı Rehberler — Türkiye Bilgi Merkezi
          </h2>
          <nav aria-label="Turkey Hub Quick Guides">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <li>
                <a
                  href="/tr/blog"
                  className="block rounded-lg border border-primary/30 bg-primary/[0.05] px-4 py-3 transition-colors hover:border-primary/60"
                >
                  <span className="font-display text-sm font-semibold text-foreground">
                    Cách tự động hóa thuế 10% năm 2026
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    2026 %10 kripto vergisi otomasyonu rehberi
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/tr/exchange/usdt-to-xaut"
                  className="block rounded-lg border border-border bg-card/50 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <span className="font-display text-sm font-semibold text-foreground">USDT → XAUt rehberi</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Tether Gold ile altın hedge</span>
                </a>
              </li>
              <li>
                <a
                  href="/tr/exchange/usdt-to-hype"
                  className="block rounded-lg border border-border bg-card/50 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <span className="font-display text-sm font-semibold text-foreground">HYPE Türkiye'den</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Hyperliquid 60 saniyede</span>
                </a>
              </li>
              <li>
                <a
                  href="/tr/compliance"
                  className="block rounded-lg border border-trust/30 bg-trust/[0.05] px-4 py-3 transition-colors hover:border-trust/60"
                >
                  <span className="font-display text-sm font-semibold text-foreground">G7 / FINTRAC doğrulama</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Kanada lisansı #C100000015</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default TurkeyHub;
