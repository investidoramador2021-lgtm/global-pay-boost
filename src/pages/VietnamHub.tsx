import { Helmet } from "react-helmet-async";
import { ShieldCheck, Sparkles, Zap, Wallet, ExternalLink, Gamepad2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ExchangeWidget from "@/components/ExchangeWidget";

const FINTRAC_URL =
  "https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search/search-by-name/";
const PAGE_URL = "https://mrcglobalpay.com/vi/vietnam";

const VietnamHub = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://mrcglobalpay.com#org",
        name: "MRC GlobalPay",
        alternateName: "MRC GlobalPay Việt Nam",
        url: "https://mrcglobalpay.com",
        logo: "https://mrcglobalpay.com/icon-512.png",
      },
      {
        "@type": "FinancialService",
        "@id": `${PAGE_URL}#service`,
        name: "MRC GlobalPay — Vietnam Hub",
        url: PAGE_URL,
        areaServed: "VN",
        knowsLanguage: "vi",
        inLanguage: "vi",
        knowsAbout: [
          "Solana",
          "Hyperliquid",
          "Giao dịch không lưu ký",
          "Non-custodial crypto exchange",
          "GameFi",
          "Crypto dust conversion",
        ],
        provider: { "@id": "https://mrcglobalpay.com#org" },
        serviceType: "Non-custodial crypto exchange",
        currenciesAccepted: "VND, SOL, HYPE, BTC, ETH, USDT, USDC",
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
            name: "Tại sao nên chọn MRC thay vì sàn giao dịch nội địa?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "MRC GlobalPay là nền tảng phi lưu ký (non-custodial) đã đăng ký MSB tại Canada (#C100000015). Người dùng Việt Nam giữ toàn quyền kiểm soát tài sản — không cần KYC, không cần ký quỹ, giao dịch ví-đến-ví trong 60 giây.",
            },
          },
          {
            "@type": "Question",
            name: "MRC có hỗ trợ cặp VND sang SOL hoặc HYPE không?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Có. Hub Việt Nam mặc định mở cặp VND → SOL và VND → HYPE, phản ánh xu hướng giao dịch bán lẻ năm 2026 tại Việt Nam.",
            },
          },
          {
            "@type": "Question",
            name: "Mức giao dịch tối thiểu là bao nhiêu?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Chỉ $0.30 — phù hợp cho game thủ GameFi muốn dọn sạch ví khỏi các token bụi không thể chi tiêu trên sàn nội địa.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MRC Việt Nam — Giao dịch SOL, HYPE Không Lưu Ký theo Tiêu chuẩn G7 | MRC GlobalPay</title>
        <meta
          name="description"
          content="Hub Việt Nam của MRC GlobalPay: giao dịch crypto phi lưu ký, không KYC, từ $0.30. SOL, HYPE, USDT — bảo mật tiêu chuẩn G7 (FINTRAC MSB #C100000015 Canada)."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content="MRC Việt Nam — Giao dịch Crypto Phi Lưu Ký Tiêu chuẩn G7" />
        <meta property="og:locale" content="vi_VN" />
        <meta name="keywords" content="trao đổi crypto Việt Nam, swap SOL VND, HYPE Việt Nam, sàn phi lưu ký, Pilot Program 2026, GameFi Việt Nam" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="container mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-trust/30 bg-trust/[0.06] px-3 py-1 text-xs font-medium text-trust">
            <ShieldCheck className="h-3.5 w-3.5" />
            Tiêu chuẩn G7 · FINTRAC MSB Canada #C100000015
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            MRC Việt Nam: Cầu nối phi lưu ký cho 21 triệu nhà giao dịch
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Giao dịch <strong className="text-foreground">SOL, HYPE, USDT</strong> trực tiếp ví-đến-ví từ <strong className="text-foreground">$0.30</strong>. Không KYC, không ký quỹ — bạn giữ toàn quyền kiểm soát tài sản theo Luật Công nghiệp Công nghệ Số 2026.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,420px]">
            {/* Pilot Program context */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card/60 p-5">
                <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Tại sao nên chọn MRC thay vì sàn giao dịch nội địa?
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Luật Công nghiệp Công nghệ Số mới của Việt Nam (hiệu lực 2026) đã chính thức công nhận tài sản số là <strong className="text-foreground">tài sản hợp pháp</strong> — nhưng giai đoạn Pilot Program chỉ cấp phép cho <strong className="text-foreground">5 tập đoàn lớn nội địa</strong>. Điều này tạo ra một "khu vườn có tường bao" hạn chế lựa chọn cho 21 triệu nhà giao dịch Việt Nam.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  MRC GlobalPay cung cấp một lựa chọn thay thế <strong className="text-foreground">phi lưu ký theo tiêu chuẩn G7</strong>: bạn không cần ký gửi tài sản cho bên thứ ba, không cần KYC cho giao dịch dưới ngưỡng AML, và toàn bộ luồng giao dịch được bảo vệ bởi giấy phép FINTRAC MSB Canada (#C100000015) — tương đương cấp độ tuân thủ của một ngân hàng.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Đặc biệt với <strong className="text-foreground">game thủ GameFi</strong>: mức tối thiểu $0.30 cho phép bạn dọn sạch ví khỏi các token thưởng nhỏ lẻ (dust) mà sàn nội địa từ chối xử lý — chuyển đổi tức thì sang SOL hoặc USDT.
                </p>
              </div>

              {/* Wallet Cleaning Solution — VN-only block */}
              <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-5">
                <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <Wallet className="h-4 w-4 text-primary" />
                  Giải pháp dọn sạch ví — chỉ có tại MRC Việt Nam
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Hơn 500 token được hỗ trợ. Mức giao dịch tối thiểu chỉ <strong className="text-foreground">$0.30</strong> — thấp nhất trong khu vực ASEAN. Lý tưởng cho người chơi Axie, Sipher, các airdrop Solana và phần thưởng GameFi rải rác trong nhiều mạng.
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Gamepad2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    Gom dust GameFi từ Polygon, BSC, Solana về một ví duy nhất
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    Thanh toán tự động trong 60 giây — không cần đăng ký tài khoản
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    Gia tăng bảo mật cho người dùng Việt Nam theo tiêu chuẩn G7
                  </li>
                </ul>
                <a
                  href={FINTRAC_URL}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  Xác minh giấy phép FINTRAC #C100000015
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Widget — defaults to SOL/HYPE per VN retail trends */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ExchangeWidget defaultFrom="usdt" defaultTo="sol" />
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Mặc định: USDT → SOL · cũng hỗ trợ USDT → HYPE
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-card/30">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "FINTRAC MSB #C100000015",
                desc: "Đăng ký Money Services Business tại Canada — tiêu chuẩn G7.",
              },
              {
                icon: Wallet,
                title: "Phi lưu ký 100%",
                desc: "Chúng tôi không bao giờ giữ tài sản của bạn. Ví-đến-ví trực tiếp.",
              },
              {
                icon: Zap,
                title: "Thanh toán 60 giây",
                desc: "Tự động hóa hoàn toàn. Không phê duyệt thủ công, không trễ hẹn.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card/60 p-4">
                <item.icon className="mb-2 h-5 w-5 text-primary" />
                <h3 className="font-display text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links — Topic Cluster for AI search authority */}
      <section className="border-b border-border">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
            Hướng dẫn nhanh — Trung tâm tài nguyên Việt Nam
          </h2>
          <nav aria-label="Vietnam Hub Quick Links">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <li>
                <a
                  href="/vi/blog"
                  className="block rounded-lg border border-primary/30 bg-primary/[0.05] px-4 py-3 transition-colors hover:border-primary/60"
                >
                  <span className="font-display text-sm font-semibold text-foreground">
                    Hướng dẫn dọn sạch ví GameFi
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Gom dust từ Axie, Sipher & airdrop Solana
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/vi/exchange/usdt-to-sol"
                  className="block rounded-lg border border-border bg-card/50 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <span className="font-display text-sm font-semibold text-foreground">Hướng dẫn giao dịch SOL</span>
                  <span className="mt-1 block text-xs text-muted-foreground">USDT → SOL với phí thấp nhất</span>
                </a>
              </li>
              <li>
                <a
                  href="/vi/exchange/usdt-to-hype"
                  className="block rounded-lg border border-border bg-card/50 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <span className="font-display text-sm font-semibold text-foreground">Mua HYPE tại Việt Nam</span>
                  <span className="mt-1 block text-xs text-muted-foreground">USDT → Hyperliquid trong 60 giây</span>
                </a>
              </li>
              <li>
                <a
                  href="/vi/compliance"
                  className="block rounded-lg border border-trust/30 bg-trust/[0.05] px-4 py-3 transition-colors hover:border-trust/60"
                >
                  <span className="font-display text-sm font-semibold text-foreground">Xác minh G7 / FINTRAC</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Giấy phép Canada #C100000015</span>
                </a>
              </li>
              <li>
                <a
                  href="/vi/blog"
                  className="block rounded-lg border border-border bg-card/50 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <span className="font-display text-sm font-semibold text-foreground">Blog & Hướng dẫn</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Phân tích thị trường Việt Nam</span>
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

export default VietnamHub;
