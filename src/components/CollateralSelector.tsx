import { useState, useMemo, useRef, useCallback } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { COLLATERAL_ASSETS, LTV_BY_RISK, type CollateralAsset } from "@/lib/coinrabbit-assets";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

/* ------------------------------------------------------------------ */
/*  Virtual list – renders only visible rows                           */
/* ------------------------------------------------------------------ */
const ROW_HEIGHT = 52;
const VISIBLE_ROWS = 6;
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

function VirtualList({
  items,
  onSelect,
}: {
  items: CollateralAsset[];
  onSelect: (a: CollateralAsset) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const startIdx = Math.floor(scrollTop / ROW_HEIGHT);
  const endIdx = Math.min(startIdx + VISIBLE_ROWS + 2, items.length);
  const offsetY = startIdx * ROW_HEIGHT;

  const handleScroll = useCallback(() => {
    if (containerRef.current) setScrollTop(containerRef.current.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-y-auto"
      style={{ height: CONTAINER_HEIGHT, position: "relative" }}
    >
      <div style={{ height: items.length * ROW_HEIGHT }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {items.slice(startIdx, endIdx).map((asset) => (
            <button
              key={asset.ticker}
              onClick={() => onSelect(asset)}
              className="flex w-full items-center gap-3 px-3 hover:bg-[#D4AF37]/10 transition-colors"
              style={{ height: ROW_HEIGHT }}
            >
              <img
                src={asset.icon}
                alt={asset.ticker}
                className="h-7 w-7 rounded-full bg-background/50"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {asset.ticker}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {asset.name}
                </div>
              </div>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  asset.riskTier === "low"
                    ? "bg-emerald-400/10 text-emerald-400"
                    : asset.riskTier === "medium"
                    ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                    : "bg-red-400/10 text-red-400"
                }`}
              >
                {asset.riskTier === "low"
                  ? "90% LTV"
                  : asset.riskTier === "medium"
                  ? "80% LTV"
                  : "70% LTV"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collateral Selector (Popover with search + virtual scroll)         */
/* ------------------------------------------------------------------ */
export interface CollateralSelectorProps {
  value: string;
  onChange: (asset: CollateralAsset) => void;
  /** Compact mode for embedding in the home widget */
  compact?: boolean;
}

export default function CollateralSelector({
  value,
  onChange,
  compact = false,
}: CollateralSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => COLLATERAL_ASSETS.find((a) => a.ticker === value) ?? COLLATERAL_ASSETS[0],
    [value],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return COLLATERAL_ASSETS;
    const q = search.toLowerCase();
    return COLLATERAL_ASSETS.filter(
      (a) =>
        a.ticker.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q),
    );
  }, [search]);

  const handleSelect = (asset: CollateralAsset) => {
    onChange(asset);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-2 rounded-lg border border-[#D4AF37]/30 bg-background/50 transition-colors hover:border-[#D4AF37]/60 ${
            compact ? "px-3 py-2" : "w-full px-4 py-3"
          }`}
        >
          <img
            src={selected.icon}
            alt={selected.ticker}
            className="h-6 w-6 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="font-semibold text-sm text-foreground">
            {selected.ticker}
          </span>
          {!compact && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {selected.name}
            </span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 p-0 border-[#D4AF37]/20"
        align="start"
        sideOffset={4}
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 130+ assets…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No assets found
          </div>
        ) : (
          <VirtualList items={filtered} onSelect={handleSelect} />
        )}

        <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground text-center">
          {COLLATERAL_ASSETS.length} supported collateral assets
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { COLLATERAL_ASSETS, LTV_BY_RISK };
export type { CollateralAsset };
