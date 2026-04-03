import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, ArrowLeft, ArrowRight, Zap } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BlogMarkdown from "@/components/blog/BlogMarkdown";
import TableOfContents, { extractHeadings } from "@/components/blog/TableOfContents";
import { fetchPostBySlug, fetchRelatedPosts, type BlogPost } from "@/lib/blog-data";
import { getLangFromPath, langPath, supportedLanguages } from "@/i18n";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);
  const lp = (path: string) => langPath(lang, path);
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([fetchPostBySlug(slug, lang), fetchRelatedPosts(slug)]).then(([p, r]) => {
      setPost(p || null);
      setRelated(r);
      setLoading(false);
    });
  }, [slug, lang]);

  // Extract H2 headings as FAQ items for FAQPage schema (must be before early returns)
  const faqItems = useMemo(() => {
    if (!post) return [];
    const headings = extractHeadings(post.content);
    return headings
      .filter((h) => h.level === 2 && h.text.includes("?"))
      .map((h) => {
        const regex = new RegExp(`## ${h.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n+([\\s\\S]*?)(?=\\n## |$)`);
        const match = post.content.match(regex);
        const answer = match
          ? match[1].replace(/###.*/g, "").replace(/\n+/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "").trim().slice(0, 300)
          : post.metaDescription;
        return { question: h.text, answer };
      });
  }, [post]);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-background py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl animate-pulse space-y-4">
              <div className="h-8 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="mt-8 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 w-full rounded bg-muted" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!post) return <Navigate to={lp("/blog")} replace />;

  const postUrl = `https://mrcglobalpay.com${lp(`/blog/${post.slug}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    url: postUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
      url: "https://mrcglobalpay.com/blog",
    },
    publisher: {
      "@type": "Organization",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    wordCount: post.content.split(/\s+/).length,
    articleSection: post.category,
    keywords: post.tags.join(", "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `https://mrcglobalpay.com${lp("/")}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `https://mrcglobalpay.com${lp("/blog")}` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  const faqJsonLd = faqItems.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  return (
    <>
      <Helmet>
        <title>{post.metaTitle} | MRC GlobalPay</title>
        <meta name="description" content={post.metaDescription} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={`https://mrcglobalpay.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.metaTitle} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://mrcglobalpay.com/blog/${post.slug}`} />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta property="article:section" content={post.category} />
        {post.tags.map((tag) => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.metaTitle} | MRC GlobalPay`} />
        <meta name="twitter:description" content={post.metaDescription} />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <link rel="alternate" type="application/rss+xml" title="MRC GlobalPay Blog RSS" href="https://mrcglobalpay.com/rss.xml" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>

      <SiteHeader />
      <main className="min-h-screen bg-background">
        <nav className="border-b border-border bg-muted/30 py-3" aria-label="Breadcrumb">
          <div className="container mx-auto flex items-center gap-2 px-4 font-body text-xs text-muted-foreground sm:text-sm">
            <Link to={lp("/")} className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link to={lp("/blog")} className="hover:text-foreground">
              Blog
            </Link>
            <span>/</span>
            <span className="truncate text-foreground">{post.title}</span>
          </div>
        </nav>

        <article className="py-10 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <header className="mb-8 sm:mb-12">
                <Link to={lp("/blog")} className="mb-4 inline-flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
                </Link>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">{post.category}</span>
                  <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {post.readTime}
                  </span>
                </div>
                <h1 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">{post.title}</h1>
                <div className="mt-4 flex items-center gap-3 font-body text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.publishedAt}>
                    Published{" "}
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  {post.updatedAt !== post.publishedAt && (
                    <>
                      <span>•</span>
                      <time dateTime={post.updatedAt}>
                        Updated{" "}
                        {new Date(post.updatedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </>
                  )}
                </div>

                <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4 sm:p-5">
                  <p className="font-display text-sm font-semibold text-foreground">{post.author.name}</p>
                  <p className="font-body text-xs text-primary">{post.author.role}</p>
                  {post.author.credentials && (
                    <p className="mt-1 font-body text-[11px] font-medium text-muted-foreground/80">{post.author.credentials}</p>
                  )}
                  <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground">{post.author.bio}</p>
                </div>
              </header>

              {/* At a Glance summary */}
              <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
                <p className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-primary">
                  <Zap className="h-4 w-4" />
                  At a Glance
                </p>
                <p className="font-body text-sm leading-relaxed text-foreground">{post.excerpt}</p>
                <ul className="mt-3 space-y-1.5 font-body text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><span className="text-primary">•</span> {post.readTime} read</li>
                  <li className="flex items-center gap-2"><span className="text-primary">•</span> Category: {post.category}</li>
                  <li className="flex items-center gap-2"><span className="text-primary">•</span> By {post.author.name}, {post.author.role}</li>
                </ul>
              </div>

              <TableOfContents markdown={post.content} />
              <BlogMarkdown content={post.content} />

              <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-muted px-3 py-1 font-body text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-border bg-muted/30 py-12 sm:py-16">
            <div className="container mx-auto px-4">
              <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">Related Articles</h2>
              <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={lp(`/blog/${r.slug}`)}
                    className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <span className="font-body text-xs text-primary">{r.category}</span>
                    <h3 className="mt-2 font-display text-sm font-semibold text-foreground transition-colors group-hover:text-primary">{r.title}</h3>
                    <p className="mt-2 flex items-center gap-1 font-body text-xs text-muted-foreground">
                      Read more <ArrowRight className="h-3 w-3" />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="border-t border-border bg-muted/50 py-10 text-center sm:py-14">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Ready to Swap Crypto Instantly?</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">500+ coins. Best rates. No account needed.</p>
            <a
              href="/#exchange"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-105"
            >
              Start Swapping <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
};

export default BlogPostPage;
