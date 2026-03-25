import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { fetchAllPosts, type BlogPost } from "@/lib/blog-data";

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPosts().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "MRC GlobalPay Blog",
    url: "https://mrcglobalpay.com/blog",
    description: "Expert guides, market analysis, and security insights for cryptocurrency trading and instant swaps.",
    publisher: {
      "@type": "Organization",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
    },
  };

  return (
    <>
      <Helmet>
        <title>Crypto Blog — Guides, Analysis & Security | MRC GlobalPay</title>
        <meta name="description" content="Expert crypto guides, market analysis, and security best practices. Learn how to swap Bitcoin, Ethereum, Solana and 500+ coins safely and efficiently." />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href="https://mrcglobalpay.com/blog" />
        <meta property="og:title" content="Crypto Blog — Guides, Analysis & Security | MRC GlobalPay" />
        <meta property="og:description" content="Expert crypto guides, market analysis, and security best practices from MRC GlobalPay." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mrcglobalpay.com/blog" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Crypto Blog — Guides, Analysis & Security | MRC GlobalPay" />
        <meta name="twitter:description" content="Expert crypto guides, market analysis, and security best practices from MRC GlobalPay." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <link rel="alternate" type="application/rss+xml" title="MRC GlobalPay Blog RSS" href="https://mrcglobalpay.com/rss.xml" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-muted/50 py-12 sm:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Crypto <span className="text-primary">Insights</span> & Guides
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-base text-muted-foreground sm:text-lg">
              Expert analysis, step-by-step swap guides, and security best practices from our blockchain research team.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid gap-8 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6 sm:p-8">
                    <div className="mb-3 h-5 w-24 rounded bg-muted" />
                    <div className="h-6 w-3/4 rounded bg-muted" />
                    <div className="mt-3 h-4 w-full rounded bg-muted" />
                    <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg sm:p-8"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </span>
                    </div>

                    <h2 className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                        <span className="text-border">•</span>
                        <span>{post.author.name}</span>
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="flex items-center gap-1 font-body text-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        Read <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-muted px-2 py-0.5 font-body text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-border bg-muted/50 py-12 text-center sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Ready to Swap?</h2>
            <p className="mx-auto mt-3 max-w-lg font-body text-muted-foreground">
              500+ cryptocurrencies. Best rates. Zero registration. Settled in under 60 seconds.
            </p>
            <a
              href="/#exchange"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-105"
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

export default Blog;
