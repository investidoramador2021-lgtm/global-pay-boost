import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import MobileBottomNav from "@/components/MobileBottomNav";
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
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

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
                  <Route path="/" element={<Index />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/aml" element={<AMLPolicy />} />
                  <Route path="/swap/sol-usdt" element={<SwapSolUsdt />} />
                  <Route path="/swap/btc-usdc" element={<SwapBtcUsdc />} />
                  <Route path="/swap/hype-usdt" element={<SwapHypeUsdt />} />
                  <Route path="/swap/eth-sol" element={<SwapEthSol />} />
                  <Route path="/swap/xrp-usdt" element={<SwapXrpUsdt />} />
                  <Route path="/swap/bera-usdt" element={<SwapBeraUsdt />} />
                  <Route path="/swap/tia-usdt" element={<SwapTiaUsdt />} />
                  <Route path="/swap/monad-usdt" element={<SwapMonadUsdt />} />
                  <Route path="/swap/pyusd-usdt" element={<SwapPyusdUsdt />} />
                  <Route path="/swap/bnb-usdc" element={<SwapBnbUsdc />} />
                  <Route path="/resources/crypto-dust-guide" element={<CryptoDustGuide />} />
                  <Route path="/resources/fractal-bitcoin-swap" element={<FractalBitcoinSwap />} />
                  <Route path="/transparency-security" element={<TransparencySecurity />} />
                  <Route path="/dust-swap-comparison" element={<DustSwapComparison />} />
                  {/* SEO keyword landing pages */}
                  <Route path="/swap/*" element={<KeywordPage />} />
                  <Route path="/buy/*" element={<KeywordPage />} />
                  <Route path="/guides/*" element={<KeywordPage />} />
                  <Route path="/tools/*" element={<KeywordPage />} />
                  <Route path="/ecosystem/*" element={<KeywordPage />} />
                  <Route path="/alternatives/*" element={<KeywordPage />} />
                  <Route path="/reviews/*" element={<KeywordPage />} />
                  <Route path="/bridge/*" element={<KeywordPage />} />
                  <Route path="/trade/*" element={<KeywordPage />} />
                  <Route path="/price/*" element={<KeywordPage />} />
                  <Route path="/local-crypto-exchange" element={<KeywordPage />} />
                  <Route path="/exchange-iu" element={<KeywordPage />} />
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
