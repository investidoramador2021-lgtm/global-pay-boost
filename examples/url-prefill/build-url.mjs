// Build a pre-filled MRC GlobalPay swap URL.
// Usage: node build-url.mjs --from=sol --to=nos --amount=10

const ORIGIN = "https://mrcglobalpay.com";

export function buildSwapUrl({ from, to, amount, address } = {}) {
  const url = new URL("/", ORIGIN);
  if (from) url.searchParams.set("from", String(from).toLowerCase());
  if (to) url.searchParams.set("to", String(to).toLowerCase());
  if (amount !== undefined && amount !== null) url.searchParams.set("amount", String(amount));
  if (address) url.searchParams.set("address", String(address));
  return url.toString();
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v];
    }),
  );
  console.log(buildSwapUrl(args));
}
