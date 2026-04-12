import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import MobileBottomNav from "@/components/MobileBottomNav";
import LangLayout from "@/components/LangLayout";
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
const Partners = lazy(() => import("./pages/Partners.tsx"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard.tsx"));
const AdminPortal = lazy(() => import("./pages/AdminPortal.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

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
    <Route path="unsubscribe" element={<Unsubscribe />} />
    <Route path="partners" element={<Partners />} />
    <Route path="dashboard" element={<PartnerDashboard />} />
    <Route path="admin-portal-mrc" element={<AdminPortal />} />
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
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ThemeProvider>
);

export default App;
