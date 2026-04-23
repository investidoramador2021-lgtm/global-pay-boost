// MRC GlobalPay Lite API — Node.js reference bot (ESM, Node 18+).
// Estimate → Create → Poll a non-custodial swap. No API key required.
// Docs: https://mrcglobalpay.com/developers#lite-api

const BASE = "https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1/lite-swap";

// --- Edit these for your trade ---------------------------------------------
const FROM = "usdterc20";
const TO = "sol";
const AMOUNT = 50;
const RECIPIENT = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"; // YOUR wallet
const POLL_MS = 15_000;
const TERMINAL = new Set(["finished", "failed", "refunded", "expired"]);
// ---------------------------------------------------------------------------

async function call(body) {
  const r = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function getStatus(id) {
  const r = await fetch(`${BASE}?action=status&id=${encodeURIComponent(id)}`);
  return r.json();
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  // 1. Estimate
  const est = await call({ action: "estimate", from: FROM, to: TO, amount: AMOUNT });
  if (est.status !== "success") {
    console.error("estimate failed:", est);
    process.exit(1);
  }
  console.log(`Estimated: ${est.estimated_amount} ${TO.toUpperCase()} (~$${est.estimated_usd.toFixed(2)})`);

  // 2. Create the non-custodial order
  const order = await call({
    action: "create",
    from: FROM,
    to: TO,
    amount: AMOUNT,
    address: RECIPIENT,
  });
  if (order.status !== "success") {
    console.error("create failed:", order);
    process.exit(1);
  }
  console.log(`\nSend ${order.from_amount} ${order.from.toUpperCase()} to ${order.deposit_address}`);
  console.log(`Order ID:   ${order.order_id}`);
  console.log(`Expires at: ${order.expires_at}\n`);

  // 3. Poll status until terminal
  while (true) {
    const s = await getStatus(order.order_id);
    console.log(`  state = ${s.state}`);
    if (TERMINAL.has(s.state)) {
      console.log("\nFinal payload:", s);
      return;
    }
    await sleep(POLL_MS);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
