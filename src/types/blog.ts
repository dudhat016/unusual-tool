export interface BlogAuthor {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface BlogSeoMetadata {
  seoTitle?: string;
  metaDescription?: string;
  h1Title?: string;
  canonicalUrl?: string;
}

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  category: string;
  tags: string[];
  author: BlogAuthor;
  coverImage?: string;
  readTime: string;
  publishedDate: string;
  updatedDate: string;
  status: 'published' | 'draft';
  seo: BlogSeoMetadata;
  views?: number;
  featured?: boolean;
  faqs?: { question: string; answer: string }[];
}
