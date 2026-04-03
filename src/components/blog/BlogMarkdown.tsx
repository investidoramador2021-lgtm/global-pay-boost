import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { slugify } from "./TableOfContents";

interface BlogMarkdownProps {
  content: string;
}

const isInternalHref = (href: string) => href.startsWith("/") || href.startsWith("/#");

const BlogMarkdown = ({ content }: BlogMarkdownProps) => {
  return (
    <div className="space-y-6 font-body text-base leading-8 text-foreground">
      <ReactMarkdown
        components={{
          a: ({ href = "", children, ...props }) => {
            if (isInternalHref(href)) {
              return (
                <Link
                  to={href}
                  className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary/80"
                  {...props}
                >
                  {children}
                </Link>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary/80"
                {...props}
              >
                {children}
              </a>
            );
          },
          h2: ({ children }) => {
            const text = typeof children === "string" ? children : extractText(children);
            const id = slugify(text);
            return (
              <h2 id={id} className="mb-4 mt-12 scroll-mt-24 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = typeof children === "string" ? children : extractText(children);
            const id = slugify(text);
            return (
              <h3 id={id} className="mb-3 mt-8 scroll-mt-24 font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                {children}
              </h3>
            );
          },
          p: ({ children }) => <p className="text-base leading-8 text-muted-foreground">{children}</p>,
          ul: ({ children }) => <ul className="ml-6 list-disc space-y-3 text-muted-foreground">{children}</ul>,
          ol: ({ children }) => <ol className="ml-6 list-decimal space-y-3 text-muted-foreground">{children}</ol>,
          li: ({ children }) => <li className="pl-1 leading-8">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="rounded-lg border border-border bg-muted/50 px-5 py-4 text-foreground">{children}</blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          hr: () => <hr className="my-8 border-border" />,
          code: ({ children, ...props }: any) =>
            props.inline ? (
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">{children}</code>
            ) : (
              <code className="block overflow-x-auto rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground">{children}</code>
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

/** Recursively extract text from React children */
function extractText(children: any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children?.props?.children) return extractText(children.props.children);
  return "";
}

export default BlogMarkdown;
