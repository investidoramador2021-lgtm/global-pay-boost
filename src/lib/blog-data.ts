import { supabase } from "@/integrations/supabase/client";
import { SEED_POSTS } from "@/lib/blog/seed-posts";
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

async function loadTranslatedPostBySlug(slug: string, lang: string): Promise<BlogPost | undefined> {
  if (lang === "en") return undefined;

  const loaders = [
    () => import("@/lib/blog/translated-btc-eth-posts").then((m) => (m.TRANSLATED_BTC_ETH_POSTS as Record<string, BlogPost | undefined>)[lang]),
    () => import("@/lib/blog/translated-liquidity-posts").then((m) => (m.TRANSLATED_LIQUIDITY_POSTS as Record<string, BlogPost | undefined>)[lang]),
    () => import("@/lib/blog/translated-security-posts").then((m) => (m.TRANSLATED_SECURITY_POSTS as Record<string, BlogPost | undefined>)[lang]),
    () => import("@/lib/blog/translated-trading-pairs-posts").then((m) => (m.TRANSLATED_TRADING_PAIRS_POSTS as Record<string, BlogPost | undefined>)[lang]),
    () => import("@/lib/blog/translated-mining-posts").then((m) => (m.TRANSLATED_MINING_POSTS as Record<string, BlogPost | undefined>)[lang]),
    () => import("@/lib/blog/translated-bridge-posts").then((m) => (m.TRANSLATED_BRIDGE_POSTS as Record<string, BlogPost | undefined>)[lang]),
  ];

  for (const load of loaders) {
    try {
      const post = await load();
      if (post?.slug === slug) {
        return post;
      }
    } catch (error) {
      console.error("Error loading translated blog post:", error);
    }
  }

  return undefined;
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
  const uniqueSeedPosts = SEED_POSTS.filter((post) => !dbSlugs.has(post.slug));

  return [...dbPosts, ...uniqueSeedPosts];
}

export async function fetchPostBySlug(slug: string, lang = "en"): Promise<BlogPost | undefined> {
  const translatedPost = await loadTranslatedPostBySlug(slug, lang);
  if (translatedPost) {
    return translatedPost;
  }

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (data) return dbRowToPost(data);

  return SEED_POSTS.find((post) => post.slug === slug);
}

export async function fetchRelatedPosts(currentSlug: string, count = 3): Promise<BlogPost[]> {
  const allPosts = await fetchAllPosts();
  return allPosts.filter((post) => post.slug !== currentSlug).slice(0, count);
}

export const blogPosts = SEED_POSTS;
export const getPostBySlug = (slug: string) => SEED_POSTS.find((post) => post.slug === slug);
export const getRelatedPosts = (currentSlug: string, count = 3) =>
  SEED_POSTS.filter((post) => post.slug !== currentSlug).slice(0, count);
