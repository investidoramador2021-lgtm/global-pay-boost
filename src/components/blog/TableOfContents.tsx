import { useMemo } from "react";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** Slugify a heading string into a URL-friendly anchor ID */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

/** Extract h2/h3 headings from markdown content */
export const extractHeadings = (markdown: string): TocItem[] => {
  const lines = markdown.split("\n");
  const headings: TocItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const text = match[2].replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
      headings.push({
        id: slugify(text),
        text,
        level: match[1].length,
      });
    }
  }

  return headings;
};

interface TableOfContentsProps {
  markdown?: string;
  items?: TocItem[];
}

const TableOfContents = ({ markdown, items: externalItems }: TableOfContentsProps) => {
  const items = useMemo(() => externalItems ?? (markdown ? extractHeadings(markdown) : []), [markdown, externalItems]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mb-8 rounded-xl border border-border bg-muted/40 p-5 sm:p-6"
    >
      <p className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
        <List className="h-4 w-4 text-primary" />
        Table of Contents
      </p>
      <ol className="space-y-1.5 font-body text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${item.id}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default TableOfContents;
