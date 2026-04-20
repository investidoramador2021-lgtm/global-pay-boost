
## Diagnosis

The 26k prerendered files are being written to `dist/exchange/btc-to-usdt/index.html`, etc. But Lovable static hosting is returning the same 22KB root shell for every URL — meaning the nested `index.html` files are **not** being served. Two likely causes:

1. **Lovable's static host doesn't auto-resolve `/exchange/btc-to-usdt` → `dist/exchange/btc-to-usdt/index.html`**. It only serves the root `index.html` and uses SPA fallback for everything else (the docs explicitly say `_redirects` is ignored, which is the file that would normally enable nested static routing).
2. Even if it did, Lovable may have a **deploy size cap** that's silently truncating the 1.3GB build, or the build artifact uploaded doesn't include the nested directories.

Without Cloudflare or a custom hosting layer, **we cannot serve per-route prerendered HTML on `mrcglobalpay.com`**. The hosting layer is the bottleneck, not the code.

## What's actually achievable on Lovable hosting (no infra changes)

Since every URL serves the same root `index.html`, the only SEO lever left is **making that single shell as rich as possible**. We've already done most of it (JSON-LD @graph, FAQ schema, 72 noscript exchange links, trust signals).

### Honest options going forward

**Option A — Accept current state, optimize the shell further**
- Add 200+ more internal links into the homepage `<noscript>` (covering the top 200 pairs instead of 72) so crawlers discover more URLs from the root page.
- Add localized JSON-LD FAQ for 12 non-English languages into the shell.
- Submit `sitemap-pairs-*.xml` directly to Google Search Console (you, manually) to force crawl of the 289k URLs even though they all serve the same shell. Google will still index them with React-Helmet-rendered titles after JS execution (Google does render JS).

**Option B — Confirm hosting actually serves nested files, then keep the prerender**
- Curl `https://mrcglobalpay.com/exchange/btc-to-usdt/index.html` (with the explicit `/index.html`) and `https://mrcglobalpay.com/exchange/btc-to-usdt/` (with trailing slash). If either returns the prerendered HTML, we just need to adjust how URLs are generated (trailing slash or `.html` suffix) and the 26k files become live.
- If both still return the 22KB shell, the prerender plugin is dead weight — remove it to cut build time/size.

**Option C — Remove the prerender plugin entirely**
If hosting truly won't serve them, the plugin is wasting 17s of build time and 1.3GB of upload. Delete it, keep the rich shell, lean fully on Google's JS rendering for pair pages.

## My recommendation

**Do Option B first** — it's a 30-second curl test that tells us definitively whether the 26k files are reachable at *any* URL pattern. If yes, we ship. If no, we delete the plugin and go all-in on Option A.

## Plan

1. Curl `mrcglobalpay.com/exchange/btc-to-usdt/index.html` and `mrcglobalpay.com/exchange/btc-to-usdt/` (trailing slash) as Googlebot. Compare byte size to the root shell (22KB).
2. **If prerendered HTML is served at any variant**: adjust the prerender output naming OR document that pair URLs need trailing slashes / leave as-is if `/index.html` works (browsers/crawlers auto-resolve).
3. **If neither works**: delete `vite-plugins/prerender-pair-routes.ts`, remove its import from `vite.config.ts`, delete `vite-plugins/top-pairs.json`, and instead **expand the homepage `<noscript>` from 72 to 300 internal pair links** so crawlers discover more URLs from the indexable shell.
4. Either way: localize the homepage FAQPage JSON-LD across 13 languages (it's a static-shell win regardless of hosting).

No Cloudflare. No new infra. Just figuring out what Lovable actually serves and shipping accordingly.
