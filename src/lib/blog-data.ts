import { supabase } from "@/integrations/supabase/client";
import { SEED_POSTS } from "@/lib/blog/seed-posts";
import { TRANSLATED_BTC_ETH_POSTS } from "@/lib/blog/translated-btc-eth-posts";
import { TRANSLATED_DUST_POSTS } from "@/lib/blog/translated-dust-posts";
import { PIX_POST_EN, TRANSLATED_PIX_POSTS } from "@/lib/blog/translated-pix-posts";
import { SEPA_POST_EN, TRANSLATED_SEPA_POSTS } from "@/lib/blog/translated-sepa-posts";
import { CARD_POST_EN, TRANSLATED_CARD_POSTS } from "@/lib/blog/translated-card-posts";
import { PRIVATE_TRANSFER_POST_EN, TRANSLATED_PRIVATE_TRANSFER_POSTS } from "@/lib/blog/translated-private-transfer-posts";
import { BEGINNERS_GUIDE_EN, TRANSLATED_BEGINNERS_GUIDE_POSTS } from "@/lib/blog/translated-beginners-guide-posts";
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
  const allSeedPosts = [...SEED_POSTS, PIX_POST_EN, SEPA_POST_EN, CARD_POST_EN, PRIVATE_TRANSFER_POST_EN, BEGINNERS_GUIDE_EN];
  const uniqueSeedPosts = allSeedPosts.filter((post) => !dbSlugs.has(post.slug));

  return [...dbPosts, ...uniqueSeedPosts];
}

export async function fetchPostBySlug(slug: string, lang = "en"): Promise<BlogPost | undefined> {
  // For non-English languages, check all translated post collections
  if (lang !== "en") {
    const translatedCollections = [TRANSLATED_BTC_ETH_POSTS, TRANSLATED_DUST_POSTS, TRANSLATED_PIX_POSTS, TRANSLATED_SEPA_POSTS, TRANSLATED_CARD_POSTS, TRANSLATED_PRIVATE_TRANSFER_POSTS, TRANSLATED_BEGINNERS_GUIDE_POSTS];
    for (const collection of translatedCollections) {
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

  const allSeed = [...SEED_POSTS, PIX_POST_EN, SEPA_POST_EN, CARD_POST_EN, PRIVATE_TRANSFER_POST_EN, BEGINNERS_GUIDE_EN];
  return allSeed.find((post) => post.slug === slug);
}

export async function fetchRelatedPosts(currentSlug: string, count = 3): Promise<BlogPost[]> {
  const allPosts = await fetchAllPosts();
  return allPosts.filter((post) => post.slug !== currentSlug).slice(0, count);
}

export const blogPosts = SEED_POSTS;
export const getPostBySlug = (slug: string) => SEED_POSTS.find((post) => post.slug === slug);
export const getRelatedPosts = (currentSlug: string, count = 3) =>
  SEED_POSTS.filter((post) => post.slug !== currentSlug).slice(0, count);
