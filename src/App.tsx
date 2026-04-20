import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SupportChatWidget from "@/components/SupportChatWidget";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import MobileBottomNav from "@/components/MobileBottomNav";
import LangLayout from "@/components/LangLayout";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.tsx"));
const AMLPolicy = lazy(() => import("./pages/AMLPolicy.tsx"));
const SwapSolUsdt = lazy(() => import("./pages/SwapSolUsdt.tsx"));
const SwapBtcUsdc = lazy(() => import("./pages/SwapBtcUsdc.tsx"));
const SwapHypeUsdt = lazy(() => import("./pages/SwapHypeUsdt.tsx"));
const SwapEthSol = lazy(() => import("./pages/SwapEthSol.tsx"));
const SwapXrpUsdt = lazy(() => import("./pages/SwapXrpUsdt.tsx"));
const SwapBeraUsdt = lazy(() => import("./pages/SwapBeraUsdt.tsx"));
const SwapTiaUsdt = lazy(() => import("./pages/SwapTiaUsdt.tsx"));
const SwapMonadUsdt = lazy(() => import("./pages/SwapMonadUsdt.tsx"));
const SwapPyusdUsdt = lazy(() => import("./pages/SwapPyusdUsdt.tsx"));
const SwapBnbUsdc = lazy(() => import("./pages/SwapBnbUsdc.tsx"));
const SwapPepeUsdt = lazy(() => import("./pages/SwapPepeUsdt.tsx"));
const SwapDogeUsdt = lazy(() => import("./pages/SwapDogeUsdt.tsx"));
const SwapTaoUsdt = lazy(() => import("./pages/SwapTaoUsdt.tsx"));
const SwapSirenUsdt = lazy(() => import("./pages/SwapSirenUsdt.tsx"));
const SwapBdagUsdt = lazy(() => import("./pages/SwapBdagUsdt.tsx"));
const SwapBonkUsdt = lazy(() => import("./pages/SwapBonkUsdt.tsx"));
const SwapPepeBtc = lazy(() => import("./pages/SwapPepeBtc.tsx"));
const SwapDogeBtc = lazy(() => import("./pages/SwapDogeBtc.tsx"));
const SwapXrpBtc = lazy(() => import("./pages/SwapXrpBtc.tsx"));
const SwapHypeBtc = lazy(() => import("./pages/SwapHypeBtc.tsx"));
const SwapTaoBtc = lazy(() => import("./pages/SwapTaoBtc.tsx"));
const SwapBonkBtc = lazy(() => import("./pages/SwapBonkBtc.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const CryptoDustGuide = lazy(() => import("./pages/CryptoDustGuide.tsx"));
const FractalBitcoinSwap = lazy(() => import("./pages/FractalBitcoinSwap.tsx"));
const TransparencySecurity = lazy(() => import("./pages/TransparencySecurity.tsx"));
const DustSwapComparison = lazy(() => import("./pages/DustSwapComparison.tsx"));
const KeywordPage = lazy(() => import("./pages/KeywordPage.tsx"));
const GetWidget = lazy(() => import("./pages/GetWidget.tsx"));
const EmbedWidget = lazy(() => import("./pages/EmbedWidget.tsx"));
const CompareDirectory = lazy(() => import("./pages/CompareDirectory.tsx"));
const ComparePage = lazy(() => import("./pages/ComparePage.tsx"));
const SolutionsDirectory = lazy(() => import("./pages/SolutionsDirectory.tsx"));
const SolutionPage = lazy(() => import("./pages/SolutionPage.tsx"));
const LearnDirectory = lazy(() => import("./pages/LearnDirectory.tsx"));
const LearnArticle = lazy(() => import("./pages/LearnArticle.tsx"));
const DeveloperHub = lazy(() => import("./pages/DeveloperHub.tsx"));
const CryptoDustCalculatorPage = lazy(() => import("./pages/CryptoDustCalculator.tsx"));
const SolanaAI = lazy(() => import("./pages/SolanaAI.tsx"));
const SolanaEcosystem = lazy(() => import("./pages/SolanaEcosystem.tsx"));
const DevelopersApi = lazy(() => import("./pages/DevelopersApi.tsx"));
const NetworkStatus = lazy(() => import("./pages/NetworkStatus.tsx"));
const Referral = lazy(() => import("./pages/Referral.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const PrivateTransfer = lazy(() => import("./pages/PrivateTransfer.tsx"));
const PermanentBridge = lazy(() => import("./pages/PermanentBridge.tsx"));
const BridgeWhitepaper = lazy(() => import("./pages/BridgeWhitepaper.tsx"));
const ShieldedWhitepaper = lazy(() => import("./pages/ShieldedWhitepaper.tsx"));
const CryptoDustSolutions = lazy(() => import("./pages/CryptoDustSolutions.tsx"));
const Compliance = lazy(() => import("./pages/Compliance.tsx"));
const CryptoDustManifesto = lazy(() => import("./pages/CryptoDustManifesto.tsx"));
const LiquidityWhitepaper = lazy(() => import("./pages/LiquidityWhitepaper.tsx"));
const WhitepaperLoans = lazy(() => import("./pages/WhitepaperLoans.tsx"));
const WhitepaperYield = lazy(() => import("./pages/WhitepaperYield.tsx"));
const SovereignWhitepaper = lazy(() => import("./pages/SovereignWhitepaper.tsx"));
const AuroraWhitepaper = lazy(() => import("./pages/AuroraWhitepaper.tsx"));
const Partners = lazy(() => import("./pages/Partners.tsx"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard.tsx"));
const AdminPortal = lazy(() => import("./pages/AdminPortal.tsx"));
const VerifyUpdate = lazy(() => import("./pages/VerifyUpdate.tsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.tsx"));
const AuditInspector = lazy(() => import("./pages/AuditInspector.tsx"));
const RegulatoryReport = lazy(() => import("./pages/RegulatoryReport.tsx"));
const InvoicePay = lazy(() => import("./pages/InvoicePay.tsx"));
const InvoiceStatus = lazy(() => import("./pages/InvoiceStatus.tsx"));
const LendEarn = lazy(() => import("./pages/LendEarn.tsx"));
const ResearchPaxgVsXaut = lazy(() => import("./pages/ResearchPaxgVsXaut.tsx"));
const ResearchRavedao = lazy(() => import("./pages/ResearchRavedao.tsx"));
const PartnerPortal = lazy(() => import("./pages/PartnerPortal.tsx"));
const DynamicExchange = lazy(() => import("./pages/DynamicExchange.tsx"));
const ExchangeDirectory = lazy(() => import("./pages/ExchangeDirectory.tsx"));
const Affiliates = lazy(() => import("./pages/Affiliates.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const EdgeFunctionAliasRedirect = () => {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);

  if (pathname.endsWith("/live-feed")) {
    return <Navigate to={params.get("format") === "rss" ? "/feed.rss" : "/feed.xml"} replace />;
  }

  if (pathname.endsWith("/dynamic-feed")) {
    return <Navigate to="/sitemap.xml" replace />;
  }

  return <Navigate to="/" replace />;
};

/**
 * Tab alias redirect: /buy and /exchange route to home with the
 * appropriate `tab` query param so the ExchangeWidget pre-selects the
 * correct mode. Preserves all other params (to, from, crypto, fiat, amount).
 */
const TabAliasRedirect = ({ tab }: { tab: "buy" | "exchange" }) => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  if (tab === "buy") {
    params.set("tab", "buy");
  } else {
    params.delete("tab");
  }
  const qs = params.toString();
  return <Navigate to={`/${qs ? `?${qs}` : ""}#exchange`} replace />;
};

/** All app routes — rendered once at root and once per language prefix */
const AppRoutes = () => (
  <>
    <Route index element={<Index />} />
    <Route path="blog" element={<Blog />} />
    <Route path="blog/:slug" element={<BlogPost />} />
    <Route path="privacy" element={<PrivacyPolicy />} />
    <Route path="terms" element={<TermsOfService />} />
    <Route path="aml" element={<AMLPolicy />} />
    <Route path="swap/sol-usdt" element={<SwapSolUsdt />} />
    <Route path="swap/btc-usdc" element={<SwapBtcUsdc />} />
    <Route path="swap/hype-usdt" element={<SwapHypeUsdt />} />
    <Route path="swap/eth-sol" element={<SwapEthSol />} />
    <Route path="swap/xrp-usdt" element={<SwapXrpUsdt />} />
    <Route path="swap/bera-usdt" element={<SwapBeraUsdt />} />
    <Route path="swap/tia-usdt" element={<SwapTiaUsdt />} />
    <Route path="swap/monad-usdt" element={<SwapMonadUsdt />} />
    <Route path="swap/pyusd-usdt" element={<SwapPyusdUsdt />} />
    <Route path="swap/bnb-usdc" element={<SwapBnbUsdc />} />
    <Route path="swap/pepe-usdt" element={<SwapPepeUsdt />} />
    <Route path="swap/doge-usdt" element={<SwapDogeUsdt />} />
    <Route path="swap/tao-usdt" element={<SwapTaoUsdt />} />
    <Route path="swap/siren-usdt" element={<SwapSirenUsdt />} />
    <Route path="swap/bdag-usdt" element={<SwapBdagUsdt />} />
    <Route path="swap/bonk-usdt" element={<SwapBonkUsdt />} />
    <Route path="swap/pepe-btc" element={<SwapPepeBtc />} />
    <Route path="swap/doge-btc" element={<SwapDogeBtc />} />
    <Route path="swap/xrp-btc" element={<SwapXrpBtc />} />
    <Route path="swap/hype-btc" element={<SwapHypeBtc />} />
    <Route path="swap/tao-btc" element={<SwapTaoBtc />} />
    <Route path="swap/bonk-btc" element={<SwapBonkBtc />} />
    <Route path="resources/crypto-dust-guide" element={<CryptoDustGuide />} />
    <Route path="resources/fractal-bitcoin-swap" element={<FractalBitcoinSwap />} />
    <Route path="transparency-security" element={<TransparencySecurity />} />
    <Route path="dust-swap-comparison" element={<DustSwapComparison />} />
    {/* SEO keyword landing pages */}
    <Route path="swap/*" element={<KeywordPage />} />
    <Route path="buy/*" element={<KeywordPage />} />
    <Route path="guides/*" element={<KeywordPage />} />
    <Route path="tools/*" element={<KeywordPage />} />
    <Route path="ecosystem/*" element={<KeywordPage />} />
    <Route path="alternatives/*" element={<KeywordPage />} />
    <Route path="reviews/*" element={<KeywordPage />} />
    <Route path="bridge/*" element={<KeywordPage />} />
    <Route path="trade/*" element={<KeywordPage />} />
    <Route path="price/*" element={<KeywordPage />} />
    <Route path="local-crypto-exchange" element={<KeywordPage />} />
    <Route path="exchange-iu" element={<KeywordPage />} />
    <Route path="get-widget" element={<GetWidget />} />
    <Route path="compare" element={<CompareDirectory />} />
    <Route path="compare/:slug" element={<ComparePage />} />
    <Route path="solutions" element={<SolutionsDirectory />} />
    <Route path="solutions/:slug" element={<SolutionPage />} />
    <Route path="learn" element={<LearnDirectory />} />
    <Route path="learn/:slug" element={<LearnArticle />} />
    <Route path="developer" element={<DeveloperHub />} />
    <Route path="tools/crypto-dust-calculator" element={<CryptoDustCalculatorPage />} />
    <Route path="ecosystem/solana" element={<SolanaEcosystem />} />
    <Route path="ecosystem/solana-ai" element={<SolanaAI />} />
    <Route path="developers" element={<DevelopersApi />} />
    <Route path="status" element={<NetworkStatus />} />
    <Route path="referral" element={<Referral />} />
    <Route path="about" element={<About />} />
    <Route path="private-transfer" element={<PrivateTransfer />} />
    <Route path="permanent-bridge" element={<PermanentBridge />} />
    <Route path="permanent-bridge/whitepaper" element={<BridgeWhitepaper />} />
    <Route path="private-transfer/whitepaper" element={<ShieldedWhitepaper />} />
    <Route path="crypto-dust-solutions" element={<CryptoDustSolutions />} />
    <Route path="compliance" element={<Compliance />} />
    <Route path="guide/crypto-dust" element={<CryptoDustManifesto />} />
    <Route path="liquidity-expansion" element={<LiquidityWhitepaper />} />
    <Route path="sovereign-settlement" element={<SovereignWhitepaper />} />
    <Route path="blog/aurora-ecosystem-mrc-globalpay-swap-aurora" element={<AuroraWhitepaper />} />
    <Route path="unsubscribe" element={<Unsubscribe />} />
    <Route path="partners" element={<Partners />} />
    <Route path="dashboard" element={<PartnerDashboard />} />
    <Route path="admin-portal-mrc" element={<AdminPortal />} />
    <Route path="verify-update" element={<VerifyUpdate />} />
    <Route path="verify-email" element={<VerifyEmail />} />
    <Route path="lend" element={<LendEarn />} />
    <Route path="blog/whitepapers/crypto-loans" element={<WhitepaperLoans />} />
    <Route path="blog/whitepapers/digital-yield" element={<WhitepaperYield />} />
    <Route path="research/paxg-vs-xaut-2026" element={<ResearchPaxgVsXaut />} />
    <Route path="research/ravedao-rave-token-analysis-2026" element={<ResearchRavedao />} />
    {/* Dynamic programmatic SEO exchange pairs */}
    <Route path="exchange/:pair" element={<DynamicExchange />} />
    {/* Crawler hub — lists every supported asset and pair */}
    <Route path="directory" element={<ExchangeDirectory />} />
    <Route path="affiliates" element={<Affiliates />} />
  </>
);

const App = () => (
  <ThemeProvider>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <div className="pb-16 lg:pb-0">
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <Routes>
                  {/* English (default, no prefix) */}
                  <Route element={<LangLayout />}>
                    {AppRoutes()}
                  </Route>
                  {/* All non-English language prefixes */}
                  {["es","pt","fr","ja","fa","ur","he","af","hi","vi","tr","uk"].map((lang) => (
                    <Route key={lang} path={`/${lang}`} element={<LangLayout />}>
                      {AppRoutes()}
                    </Route>
                  ))}
                  {/* Standalone embed widget (no header/footer/nav) */}
                  <Route path="/embed/widget" element={<EmbedWidget />} />
                  {/* Institutional Partner Portal — standalone, own auth */}
                  <Route path="/partner-portal" element={<PartnerPortal />} />
                  {/* Invoice public pages — no auth required */}
                  <Route path="/pay/:token" element={<InvoicePay />} />
                  <Route path="/status/:token" element={<InvoiceStatus />} />
                  {/* Admin Inspector — MFA-protected, hidden */}
                  <Route path="/admin/audit-inspector" element={<AuditInspector />} />
                  {/* Regulatory Report — read-only printable page */}
                  <Route path="/regulatory-report/:token" element={<RegulatoryReport />} />
                  <Route path="/functions/v1/live-feed" element={<EdgeFunctionAliasRedirect />} />
                  <Route path="/functions/v1/dynamic-feed" element={<EdgeFunctionAliasRedirect />} />
                  {/* Deep-link aliases: /buy?to=xec and /exchange?to=nvda → home with pre-selected tab */}
                  <Route path="/buy" element={<TabAliasRedirect tab="buy" />} />
                  <Route path="/exchange" element={<TabAliasRedirect tab="exchange" />} />
                  {/* Legacy route redirect */}
                  <Route path="/admin/compliance-vault" element={<Navigate to="/admin/audit-inspector" replace />} />
                  <Route path="/audit-report/:token" element={<Navigate to="/admin/audit-inspector" replace />} />
                  {/* Redirect legacy sell/payout and old WordPress URLs to home */}
                  <Route path="/sell" element={<Navigate to="/" replace />} />
                  <Route path="/sell/*" element={<Navigate to="/" replace />} />
                  <Route path="/payout" element={<Navigate to="/" replace />} />
                  <Route path="/payout/*" element={<Navigate to="/" replace />} />
                  <Route path="/de/*" element={<Navigate to="/" replace />} />
                  <Route path="/wp-*" element={<Navigate to="/" replace />} />
                  <Route path="/wordpress/*" element={<Navigate to="/" replace />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
            <MobileBottomNav />
            <SupportChatWidget />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ThemeProvider>
);

export default App;