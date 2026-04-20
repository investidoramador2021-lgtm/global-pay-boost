import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

const supabase = createClient(
  'https://tjikwxkmsfmyjkssvyoh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaWt3eGttc2ZteWprc3N2eW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTkwODQsImV4cCI6MjA4OTA5NTA4NH0.Fj9aTAcYIP4HTuirEAox4E1z8Y707k1c2JPf6dl5l88'
);

// Tier ranking: lower is better
const FROM_RANK = {btc:1,eth:2,usdt:3,usdc:4,sol:5,bnb:6,xrp:7,doge:8,ton:9,trx:10,ada:11,dot:12,matic:13,pol:13,ltc:14,bch:15,xmr:16,avax:17,link:18,near:19,atom:20,arb:21,op:22,sui:23,apt:24,hbar:25,xlm:26,etc:27,fil:28,vet:29,algo:30,icp:31,aave:32,uni:33,shib:34,pepe:35,wif:36,bonk:37,floki:38,jup:39,jto:40,tia:41,sei:42,inj:43,rune:44,mkr:45,ldo:46,grt:47,sand:48,mana:49,axs:50};
const TO_RANK = {usdt:1,usdc:2,btc:3,eth:4,sol:5,bnb:6,xrp:7,doge:8,ton:9,trx:10,xmr:11,pol:12,matic:12,ada:13,avax:14,link:15,ltc:16,shib:17,pepe:18,wif:19,bonk:20,tia:21,sui:22,apt:23};

const fromList = Object.keys(FROM_RANK);
const all = [];
const PAGE = 1000;
let offset = 0;
while (true) {
  const { data, error } = await supabase
    .from('pairs')
    .select('from_ticker,to_ticker,seo_title,seo_description,seo_h1')
    .eq('is_valid', true)
    .in('from_ticker', fromList)
    .range(offset, offset + PAGE - 1);
  if (error) throw error;
  if (!data || data.length === 0) break;
  all.push(...data);
  if (data.length < PAGE) break;
  offset += PAGE;
}
console.log('fetched', all.length);

// Group by from_ticker, sort each group by to-ticker rank, cap per from
const byFrom = {};
for (const r of all) {
  (byFrom[r.from_ticker] ||= []).push(r);
}
for (const k of Object.keys(byFrom)) {
  byFrom[k].sort((a,b) => {
    const tr = (TO_RANK[a.to_ticker] ?? 999) - (TO_RANK[b.to_ticker] ?? 999);
    if (tr) return tr;
    return a.to_ticker.localeCompare(b.to_ticker);
  });
}

// Round-robin selection: pick top tokens up to a per-from cap, prioritising
// lower from_rank (BTC, ETH, USDT first).
const fromKeysSorted = Object.keys(byFrom).sort(
  (a, b) => (FROM_RANK[a] ?? 999) - (FROM_RANK[b] ?? 999)
);

// Tier-1 (rank 1-10) gets up to 80 pairs each; Tier-2 (11-25) gets 40; rest 20
function capFor(from) {
  const r = FROM_RANK[from] ?? 999;
  if (r <= 10) return 80;
  if (r <= 25) return 40;
  return 20;
}

const top = [];
for (const from of fromKeysSorted) {
  const cap = capFor(from);
  const slice = byFrom[from].slice(0, cap);
  top.push(...slice);
}
console.log('after cap:', top.length, 'unique from:', new Set(top.map(p=>p.from_ticker)).size);

// If we have fewer than 2000, fill from remaining (unranked overflow per from)
if (top.length < 2000) {
  const seen = new Set(top.map(p => `${p.from_ticker}-${p.to_ticker}`));
  for (const from of fromKeysSorted) {
    if (top.length >= 2000) break;
    for (const r of byFrom[from]) {
      if (top.length >= 2000) break;
      const k = `${r.from_ticker}-${r.to_ticker}`;
      if (!seen.has(k)) { top.push(r); seen.add(k); }
    }
  }
}
const final = top.slice(0, 2000);
writeFileSync('vite-plugins/top-pairs.json', JSON.stringify(final));
const finalCounts = {};
for (const p of final) finalCounts[p.from_ticker] = (finalCounts[p.from_ticker]||0)+1;
console.log('wrote', final.length, 'pairs. distribution:', finalCounts);
