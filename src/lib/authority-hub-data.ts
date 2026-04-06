export interface AuthorityArticle {
  topic: string;
  slug: string;
  category: string;
  key_fact: string;
  trust_signal: string;
}

export const AUTHORITY_ARTICLES: AuthorityArticle[] = [
  {
    topic: "Non-Custodial Exchange",
    slug: "why-non-custodial-is-safer",
    category: "Security",
    key_fact: "We never hold your crypto",
    trust_signal: "Your keys = Your crypto throughout the swap",
  },
  {
    topic: "MSB Registration",
    slug: "canadian-fintrac-msb",
    category: "Legal",
    key_fact: "Registered with FINTRAC Canada",
    trust_signal: "Full AML/KYC compliance under Canadian law",
  },
  {
    topic: "Partner Security",
    slug: "our-liquidity-partners",
    category: "Infrastructure",
    key_fact: "Secured by ChangeNOW & Fireblocks",
    trust_signal: "Institutional-grade MPC security via our partners",
  },
  {
    topic: "Zero-Account Privacy",
    slug: "swap-without-registration",
    category: "Privacy",
    key_fact: "No personal data storage",
    trust_signal: "Trade instantly without creating an account",
  },
  {
    topic: "Transaction Transparency",
    slug: "tracking-your-micro-swap",
    category: "Transparency",
    key_fact: "On-chain verification",
    trust_signal: "Real-time blockchain tracking for every $0.30 swap",
  },
];

export const getArticleBySlug = (slug: string): AuthorityArticle | undefined =>
  AUTHORITY_ARTICLES.find((a) => a.slug === slug);

export const getOtherArticles = (currentSlug: string): AuthorityArticle[] =>
  AUTHORITY_ARTICLES.filter((a) => a.slug !== currentSlug);
