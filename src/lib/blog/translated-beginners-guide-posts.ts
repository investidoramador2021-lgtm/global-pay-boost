import { seedAuthors } from "./seed-authors";
import type { BlogPost } from "./types";

export const BEGINNERS_GUIDE_EN: BlogPost = {
  slug: "beginners-guide-digital-assets-wallet-to-swap",
  title: "The Absolute Beginner's Guide to Digital Assets: From Wallet to Swap",
  metaTitle: "Beginner's Guide to Crypto Wallets & Swaps | MRC GlobalPay",
  metaDescription: "Learn how to set up a digital wallet, find your address, and swap crypto in under 5 minutes. No experience needed. Step-by-step guide from a Registered Canadian MSB.",
  excerpt: "A complete, zero-jargon walkthrough for first-time digital asset users. Learn how to install a wallet, find your address, and complete your first swap on MRC GlobalPay — all in under 5 minutes.",
  author: seedAuthors.danielCarter,
  publishedAt: "2026-04-12",
  updatedAt: "2026-04-12",
  readTime: "12 min read",
  category: "Guides",
  tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
  content: `Welcome to MRC GlobalPay. We are a Registered Canadian Money Services Business (MSB). This guide will show you how to set up your digital vault and move funds globally in under 5 minutes, with no technical experience required.

## Why do I need a "Digital Vault" to hold my funds?

To hold digital assets, you need a **Wallet**. Think of this as a **private bank account** that exists only on your phone. Unlike a traditional bank, you are in full control — no middlemen, no approvals, no delays.

Your wallet is your vault. It stores your assets securely and gives you a unique **"Account Number"** (called an Address) for each type of coin you hold.

## How do I set up my wallet? (Step 1)

Setting up your wallet takes less than 2 minutes:

- Open your phone's **App Store** (iPhone) or **Play Store** (Android)
- Search for **"Trust Wallet"** (Look for the Blue Shield icon)
- Download and open the app
- Tap **"Create a new wallet"**

### ⚠️ THE GOLDEN RULE

The app will show you **12 words**. This is your **Physical Key**.

- **Write them down on paper**
- **Store that paper in a safe place**
- **If you lose these words, you lose your money**
- **Never share them with anyone, including us**

Think of these 12 words as the master key to your vault. There is no "forgot password" button. This is the tradeoff for having a truly private, self-controlled account.

## How do I find my "Account Number" (Address)? (Step 2)

Every asset has a unique **"Account Number"** (called an Address). You need this to receive money.

- On the main screen of the app, tap the coin you want (e.g., **Bitcoin** or **USDT**)
- Tap the big **[RECEIVE]** button
- You will see a long code of letters and numbers (Example: 0x71C...)
- Tap the **[COPY]** button

**CEO Tip:** Never type this code by hand. Always use the **[COPY]** and **[PASTE]** buttons. One wrong letter means the money is lost forever.

Think of this like an email address — if even one character is wrong, the message (or money) goes to the wrong place, and there is no way to get it back.

## How do I swap on MRC GlobalPay? (Step 3)

Now that you have your code, you can use our website to exchange assets instantly.

- Go to [mrcglobalpay.com](/)
- **You Send:** Choose the coin you are giving
- **You Get:** Choose the coin you want to receive
- **Recipient Address:** Hold your finger in the box and select **PASTE**. This is where you put the code you copied in Step 2
- **Start Swap:** Tap **[Exchange Now]**

### The Transfer

- Our website will show you a **"Deposit Address."** Copy it
- Go back to your Trust Wallet, tap **[SEND]**, and **Paste** our address there
- Send the amount
- That's it — the swap is now in progress

## What happens after I send my funds? (Step 4)

Here is what you'll see on screen after initiating your swap:

- **Waiting:** Our system will say **"Waiting for Deposit"**
- **Confirming:** Once you send the funds, the screen will change to **"Confirming."** This is just the network verifying the safety of the trade (5–10 minutes)
- **Success:** Within minutes, your new coins will appear automatically in your Trust Wallet

You don't need to do anything else. The process is fully automated. Just sit back and wait for the confirmation.

## What if I'm afraid of losing money?

This is completely normal. Here is our recommendation:

**Start with a $1.00 "test swap."** This lets you see exactly how the system works before moving larger amounts. MRC GlobalPay supports swaps from as low as **$0.30**, so there is no barrier to testing.

MRC GlobalPay is a **Registered Canadian Money Services Business (MSB)**. Your transaction is processed through the same regulated infrastructure used by institutional clients.

## Where can I find my address if I'm lost?

Follow these exact steps:

- Open **Trust Wallet**
- Tap the **Coin** you want to receive
- Tap **[RECEIVE]**
- Tap **[COPY]**
- Come back to [mrcglobalpay.com](/) and **PASTE** it into the Recipient Address field

If you're still stuck, our 24/7 AI Concierge (bottom-right of the screen) can walk you through it in your language.

## Do I need to create an account on MRC GlobalPay?

**No.** Your Trust Wallet **is** your account. MRC GlobalPay does not store your personal data, ensuring your total privacy. There is no registration, no KYC forms, and no waiting periods.

Just paste your address, choose your coins, and swap. It's that simple.

## Why is my transaction taking a while?

Digital networks perform a safety check called **"Confirmation."** This usually takes **5–15 minutes**. Your funds are safe and will appear in your wallet as soon as the check is complete.

Think of it like a bank transfer that says "processing" — the money has left one account and is on its way to the other. It just needs a few minutes for the network to verify everything is correct.

## Quick Reference: The Complete Flow

- **Step 1:** Download Trust Wallet → Create Wallet → Save your 12 words
- **Step 2:** Tap Coin → Tap [RECEIVE] → Tap [COPY]
- **Step 3:** Go to [mrcglobalpay.com](/) → Choose coins → PASTE your address → Tap [Exchange Now]
- **Step 4:** Copy the Deposit Address → Go to Trust Wallet → Tap [SEND] → PASTE → Send
- **Done:** Wait 5–15 minutes. Your new coins appear automatically.

---

*This guide is published by MRC GlobalPay, a Registered Canadian Money Services Business (MSB Registration: C100000015). For questions, use the 24/7 AI Concierge on our website or visit our [FAQ page](/faq).*`,
};

/** Translated versions keyed by language code */
export const TRANSLATED_BEGINNERS_GUIDE_POSTS: Record<string, BlogPost> = {};
