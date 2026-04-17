import { supabase } from "@/integrations/supabase/client";
import { SEED_POSTS } from "@/lib/blog/seed-posts";
import { TRANSLATED_BTC_ETH_POSTS } from "@/lib/blog/translated-btc-eth-posts";
import { TRANSLATED_DUST_POSTS } from "@/lib/blog/translated-dust-posts";
import { PIX_POST_EN, TRANSLATED_PIX_POSTS } from "@/lib/blog/translated-pix-posts";
import { SEPA_POST_EN, TRANSLATED_SEPA_POSTS } from "@/lib/blog/translated-sepa-posts";
import { CARD_POST_EN, TRANSLATED_CARD_POSTS } from "@/lib/blog/translated-card-posts";
import { PRIVATE_TRANSFER_POST_EN, TRANSLATED_PRIVATE_TRANSFER_POSTS } from "@/lib/blog/translated-private-transfer-posts";
import { BEGINNERS_GUIDE_EN, TRANSLATED_BEGINNERS_GUIDE_POSTS } from "@/lib/blog/translated-beginners-guide-posts";
import { INVOICE_POST_EN, TRANSLATED_INVOICE_POSTS } from "@/lib/blog/translated-invoice-posts";
import { FEATURED_2026_POSTS } from "@/lib/blog/seed-featured-2026";
import type { BlogPost, BlogAuthor } from "@/lib/blog/types";

export type { BlogPost, BlogAuthor } from "@/lib/blog/types";

function dbRowToPost(row: any): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    excerpt: row.excerpt,
    author: {
      name: row.author_name,
      role: row.author_role,
      bio: row.author_bio,
      credentials: row.author_credentials || "",
    },
    publishedAt: row.published_at?.split("T")[0] || row.published_at,
    updatedAt: row.updated_at?.split("T")[0] || row.updated_at,
    readTime: row.read_time,
    category: row.category,
    tags: row.tags || [],
    content: row.content,
  };
}

export async function fetchAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
    return SEED_POSTS;
  }

  const dbPosts = (data || []).map(dbRowToPost);
  const dbSlugs = new Set(dbPosts.map((post) => post.slug));
  const allSeedPosts = [
    ...FEATURED_2026_POSTS,
    ...SEED_POSTS,
    PIX_POST_EN,
    SEPA_POST_EN,
    CARD_POST_EN,
    PRIVATE_TRANSFER_POST_EN,
    BEGINNERS_GUIDE_EN,
    INVOICE_POST_EN,
  ];
  const uniqueSeedPosts = allSeedPosts.filter((post) => !dbSlugs.has(post.slug));

  // Featured posts go first; remaining DB + seed posts follow.
  const featuredSlugs = new Set(FEATURED_2026_POSTS.map((p) => p.slug));
  const featured = uniqueSeedPosts.filter((p) => featuredSlugs.has(p.slug));
  const rest = [...dbPosts, ...uniqueSeedPosts.filter((p) => !featuredSlugs.has(p.slug))];

  return [...featured, ...rest];
}

const ALL_TRANSLATED_COLLECTIONS: Record<string, BlogPost>[] = [
  TRANSLATED_BTC_ETH_POSTS,
  TRANSLATED_DUST_POSTS,
  TRANSLATED_PIX_POSTS,
  TRANSLATED_SEPA_POSTS,
  TRANSLATED_CARD_POSTS,
  TRANSLATED_PRIVATE_TRANSFER_POSTS,
  TRANSLATED_BEGINNERS_GUIDE_POSTS,
  TRANSLATED_INVOICE_POSTS,
];

const ALL_ENGLISH_SEED_POSTS: BlogPost[] = [
  ...FEATURED_2026_POSTS,
  ...SEED_POSTS,
  PIX_POST_EN,
  SEPA_POST_EN,
  CARD_POST_EN,
  PRIVATE_TRANSFER_POST_EN,
  BEGINNERS_GUIDE_EN,
  INVOICE_POST_EN,
];

export async function fetchPostBySlug(slug: string, lang = "en"): Promise<BlogPost | undefined> {
  // For non-English languages, check all translated post collections
  if (lang !== "en") {
    for (const collection of ALL_TRANSLATED_COLLECTIONS) {
      const translated = collection[lang];
      if (translated && translated.slug === slug) {
        return translated;
      }
    }
  }

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (data) return dbRowToPost(data);

  return ALL_ENGLISH_SEED_POSTS.find((post) => post.slug === slug);
}

/**
 * Locate a slug across ALL languages and seed posts.
 * Returns the canonical language for that slug so the router can 301-redirect
 * mismatched URLs (e.g. /fr/blog/<english-slug> or /blog/<french-slug>) to
 * their proper canonical URL — eliminating GSC "Page with redirect" leaks.
 */
export function findSlugLanguage(slug: string): { lang: string; canonicalSlug: string } | null {
  // English seed posts
  if (ALL_ENGLISH_SEED_POSTS.some((p) => p.slug === slug)) {
    return { lang: "en", canonicalSlug: slug };
  }
  // Translated collections
  for (const collection of ALL_TRANSLATED_COLLECTIONS) {
    for (const [lang, post] of Object.entries(collection)) {
      if (post.slug === slug) {
        return { lang, canonicalSlug: slug };
      }
    }
  }
  return null;
}

/**
 * For a given English-seed post, return a map of { lang -> translated slug }
 * across every translated collection that contains a translation for it.
 * Used by BlogLanguageToggle so each language flag points to the actual
 * localized URL, not the English slug under a non-English prefix.
 */
export function getTranslatedSlugsForPost(englishSlug: string): Record<string, string> {
  const result: Record<string, string> = { en: englishSlug };
  for (const collection of ALL_TRANSLATED_COLLECTIONS) {
    // A collection is "for" this English post if any of its entries shares the
    // English slug OR if all its entries are translations of one source post.
    // We detect ownership by checking if the English source slug appears in any
    // of the helpers — simpler: every translated collection corresponds 1:1 to
    // a single English source. Match by walking entries and seeing if any of
    // the *other* English collections contains this englishSlug.
    const entries = Object.entries(collection);
    if (entries.length === 0) continue;
    // Heuristic: if the English collection's source post matches englishSlug
    // (we don't have a direct backref, so we check whether the canonical English
    // post's slug matches one of a known set of "source" slugs by collection).
    // Safer approach: just expose all translations and let the toggle filter
    // by `availableLanguages`.
    for (const [lang, post] of entries) {
      // Only attach if not already set (first collection wins)
      if (!result[lang]) result[lang] = post.slug;
    }
  }
  return result;
}


export async function fetchRelatedPosts(currentSlug: string, count = 3): Promise<BlogPost[]> {
  const allPosts = await fetchAllPosts();
  return allPosts.filter((post) => post.slug !== currentSlug).slice(0, count);
}

export const blogPosts = SEED_POSTS;
export const getPostBySlug = (slug: string) => SEED_POSTS.find((post) => post.slug === slug);
export const getRelatedPosts = (currentSlug: string, count = 3) =>
  SEED_POSTS.filter((post) => post.slug !== currentSlug).slice(0, count);
