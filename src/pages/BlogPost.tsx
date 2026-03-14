import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog-data";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const post = slug ? getPostBySlug(slug) : undefined;

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelatedPosts(post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    url: `https://mrcglobalpay.com/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.author.name,
      url: "https://mrcglobalpay.com",
    },
    publisher: {
      "@type": "Organization",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://mrcglobalpay.com/blog/${post.slug}`,
    },
    wordCount: post.content.split(/\s+/).length,
    articleSection: post.category,
    keywords: post.tags.join(", "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://mrcglobalpay.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://mrcglobalpay.com/blog/${post.slug}` },
    ],
  };

  // Custom renderer to convert markdown links to React Router Links for internal navigation
  const components = {
    a: ({ href, children, ...props }: any) => {
      if (href && (href.startsWith("/") || href.startsWith("/#"))) {
        return (
          <Link to={href} className="text-primary underline underline-offset-2 hover:text-primary/80" {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} className="text-primary underline underline-offset-2 hover:text-primary/80" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },
  };

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
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta property="article:section" content={post.category} />
        {post.tags.map((tag) => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
        <link rel="alternate" type="application/rss+xml" title="MRC GlobalPay Blog RSS" href="https://mrcglobalpay.com/rss.xml" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="border-b border-border bg-muted/30 py-3" aria-label="Breadcrumb">
          <div className="container mx-auto flex items-center gap-2 px-4 font-body text-xs text-muted-foreground sm:text-sm">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <span>/</span>
            <span className="truncate text-foreground">{post.title}</span>
          </div>
        </nav>

        <article className="py-10 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              {/* Header */}
              <header className="mb-8 sm:mb-12">
                <Link to="/blog" className="mb-4 inline-flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
                </Link>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {post.readTime}
                  </span>
                </div>
                <h1 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                  {post.title}
                </h1>
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

                {/* Author E-E-A-T box */}
                <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4 sm:p-5">
                  <p className="font-display text-sm font-semibold text-foreground">{post.author.name}</p>
                  <p className="font-body text-xs text-primary">{post.author.role}</p>
                  {post.author.credentials && (
                    <p className="mt-1 font-body text-[11px] font-medium text-muted-foreground/80">{post.author.credentials}</p>
                  )}
                  <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground">{post.author.bio}</p>
                </div>
              </header>

              {/* Content */}
              <div className="prose prose-sm prose-invert max-w-none font-body text-foreground sm:prose-base prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                <ReactMarkdown components={components}>{post.content}</ReactMarkdown>
              </div>

              {/* Tags */}
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

        {/* Related Posts */}
        <section className="border-t border-border bg-muted/30 py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
              Related Articles
            </h2>
            <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <span className="font-body text-xs text-primary">{r.category}</span>
                  <h3 className="mt-2 font-display text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {r.title}
                  </h3>
                  <p className="mt-2 flex items-center gap-1 font-body text-xs text-muted-foreground">
                    Read more <ArrowRight className="h-3 w-3" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-muted/50 py-10 text-center sm:py-14">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              Ready to Swap Crypto Instantly?
            </h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              500+ coins. Best rates. No account needed.
            </p>
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

export default BlogPost;
