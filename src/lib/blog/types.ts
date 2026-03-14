export interface BlogAuthor {
  name: string;
  role: string;
  bio: string;
  credentials: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  author: BlogAuthor;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  category: string;
  tags: string[];
  content: string;
}
