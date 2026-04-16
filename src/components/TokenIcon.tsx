import { useState } from "react";
import { cn } from "@/lib/utils";

interface TokenIconProps {
  src?: string | null;
  ticker: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}

const TICKER_COLORS: Record<string, string> = {
  btc: "bg-orange-600", eth: "bg-blue-500", sol: "bg-purple-500",
  usdt: "bg-emerald-600", usdc: "bg-blue-600", xrp: "bg-gray-500",
  bnb: "bg-yellow-500", doge: "bg-yellow-600", ada: "bg-blue-400",
  trx: "bg-red-500", dot: "bg-pink-500", matic: "bg-purple-600",
  avax: "bg-red-600", link: "bg-blue-700", ltc: "bg-gray-400",
  xaut: "bg-yellow-700", paxg: "bg-yellow-500", dai: "bg-amber-500",
  shib: "bg-orange-500", ton: "bg-sky-500",
};

function getColor(ticker: string) {
  return TICKER_COLORS[ticker.toLowerCase()] || "bg-[#2A2D35]";
}

export default function TokenIcon({ src, ticker, alt, className = "h-5 w-5", loading = "lazy" }: TokenIconProps) {
  const [failed, setFailed] = useState(false);
  const initial = ticker.slice(0, 2).toUpperCase();

  if (!src || failed) {
    return (
      <span
        className={cn("inline-flex items-center justify-center rounded-full text-white font-bold select-none shrink-0", getColor(ticker), className)}
        style={{ fontSize: "45%" }}
        aria-hidden="true"
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ticker.toUpperCase()}
      className={cn("rounded-full object-cover bg-[#1A1D25] shrink-0", className)}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
