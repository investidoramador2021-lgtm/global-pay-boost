import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsOfService from "./pages/TermsOfService.tsx";
import AMLPolicy from "./pages/AMLPolicy.tsx";
import SwapSolUsdt from "./pages/SwapSolUsdt.tsx";
import SwapBtcUsdc from "./pages/SwapBtcUsdc.tsx";
import SwapHypeUsdt from "./pages/SwapHypeUsdt.tsx";
import SwapEthSol from "./pages/SwapEthSol.tsx";
import SwapXrpUsdt from "./pages/SwapXrpUsdt.tsx";
import SwapBeraUsdt from "./pages/SwapBeraUsdt.tsx";
import SwapTiaUsdt from "./pages/SwapTiaUsdt.tsx";
import SwapMonadUsdt from "./pages/SwapMonadUsdt.tsx";
import SwapPyusdUsdt from "./pages/SwapPyusdUsdt.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ThemeProvider>
);

export default App;
