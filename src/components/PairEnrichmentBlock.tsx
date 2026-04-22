/**
 * Renders the curated, pair-specific enrichment block (intro paragraph,
 * step-by-step guide, fees/speed/minimum notes, "People also swap" links).
 *
 * Only renders when a curated entry exists for the pair — keeps thin
 * pages untouched and avoids over-promising on long-tail routes.
 *
 * Visual language matches DynamicExchange (dark surface #0B0D10,
 * #00E676 accent, #2A2D35 borders, font-display headings).
 */

import { Link } from "react-router-dom";
import {
  Coins,
  ListChecks,
  ArrowRightLeft,
  Receipt,
  Timer,
  CheckCircle2,
} from "lucide-react";
import type { PairEnrichment } from "@/lib/pair-enrichment";
import { langPath } from "@/i18n";

interface Props {
  enrichment: PairEnrichment;
  fromUp: string;
  toUp: string;
  lang: string;
}

export default function PairEnrichmentBlock({ enrichment, fromUp, toUp, lang }: Props) {
  const lp = (p: string) => langPath(lang, p);

  return (
    <section
      className="border-t border-[#1E2028] py-12"
      aria-labelledby={`pair-enrichment-${fromUp}-${toUp}`}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* ─── Intro paragraph ─── */}
          <article>
            <h2
              id={`pair-enrichment-${fromUp}-${toUp}`}
              className="font-display text-xl font-bold text-white sm:text-2xl mb-3 flex items-center gap-2"
            >
              <Coins className="h-5 w-5 text-[#00E676]" />
              Why swap {fromUp} to {toUp}?
            </h2>
            <p className="text-sm text-[#C4C8D0] leading-relaxed sm:text-base">
              {enrichment.intro}
            </p>
          </article>

          {/* ─── Pair-specific step-by-step ─── */}
          <article>
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl mb-3 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-[#00E676]" />
              Step-by-step: {fromUp} → {toUp}
            </h2>
            <ol className="space-y-4">
              {enrichment.steps.map((s, i) => (
                <li key={i} className="flex gap-4 rounded-xl border border-[#2A2D35] bg-[#12141A] p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00E676]/10 font-display text-sm font-bold text-[#00E676]">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white">{s.title}</h3>
                    <p className="mt-1 text-sm text-[#8A8F98] leading-relaxed">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          {/* ─── Fees / Speed / Minimum ─── */}
          <article>
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl mb-3 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#00E676]" />
              Fees, speed, and minimum for {fromUp} → {toUp}
            </h2>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#00E676]">
                  <Receipt className="h-4 w-4" /> Fees
                </dt>
                <dd className="mt-2 text-sm text-[#C4C8D0] leading-relaxed">{enrichment.notes.fees}</dd>
              </div>
              <div className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#00E676]">
                  <Timer className="h-4 w-4" /> Speed
                </dt>
                <dd className="mt-2 text-sm text-[#C4C8D0] leading-relaxed">{enrichment.notes.speed}</dd>
              </div>
              <div className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#00E676]">
                  <CheckCircle2 className="h-4 w-4" /> Minimum
                </dt>
                <dd className="mt-2 text-sm text-[#C4C8D0] leading-relaxed">{enrichment.notes.minimum}</dd>
              </div>
            </dl>
          </article>

          {/* ─── People also swap ─── */}
          {enrichment.peopleAlso.length > 0 && (
            <article>
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl mb-3 flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-[#00E676]" />
                People also swap
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {enrichment.peopleAlso.map((l) => (
                  <li key={`${l.from}-${l.to}`}>
                    <Link
                      to={lp(`/exchange/${l.from}-to-${l.to}`)}
                      className="group flex items-center justify-between rounded-xl border border-[#2A2D35] bg-[#12141A] px-4 py-3 transition-colors hover:border-[#00E676]/40 hover:bg-[#161920]"
                    >
                      <span className="font-display text-sm font-semibold text-white">{l.label}</span>
                      <ArrowRightLeft className="h-4 w-4 text-[#8A8F98] transition-colors group-hover:text-[#00E676]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
