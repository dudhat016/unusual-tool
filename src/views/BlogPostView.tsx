import React, { useEffect, useState } from 'react';
import { BlogService } from '../services/BlogService';
import { BlogPostItem } from '../types/blog';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ContentRenderer } from '../components/common/ContentRenderer';
import { DynamicFaqAccordion } from '../components/common/DynamicFaqAccordion';
import { TableOfContents } from '../components/common/TableOfContents';
import { Link } from '../components/common/Link';
import {
  Calendar,
  Clock,
  User,
  Share2,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Tag,
  Loader2,
} from 'lucide-react';
import { slugify } from '../utils/slugify';

interface BlogPostViewProps {
  slug: string;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({ slug }) => {
  const [post, setPost] = useState<BlogPostItem | null>(() => BlogService.getPostBySlug(slug) || null);
  const [isLoading, setIsLoading] = useState(!post);
  const [allPosts, setAllPosts] = useState<BlogPostItem[]>(() => BlogService.getPublishedPosts());

  useEffect(() => {
    let isMounted = true;
    setIsLoading(!post);

    // Fetch from Firestore
    BlogService.fetchPostBySlug(slug).then((fetched) => {
      if (isMounted) {
        setPost(fetched);
        setIsLoading(false);
      }
    });

    // Subscribe to published list
    const unsub = BlogService.subscribePublishedPosts((posts) => {
      if (isMounted) {
        setAllPosts(posts);
        const matching = posts.find(
          (p) =>
            p.slug.toLowerCase() === slug.toLowerCase() ||
            p.id.toLowerCase() === slug.toLowerCase()
        );
        if (matching) {
          setPost(matching);
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [slug]);

  useEffect(() => {
    if (post?.id) {
      BlogService.incrementViews(post.id);
    }
  }, [post?.id]);

  if (isLoading && !post) {
    return (
      <div className="py-24 text-center space-y-4 max-w-2xl mx-auto">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading article from Firestore database...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Article Not Found</h1>
        <p className="text-xs text-slate-500">
          The requested blog post &quot;{slug}&quot; could not be found in our publication database.
        </p>
        <Link
          href="/blog"
          className="inline-block px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
        >
          Back to Editorial Hub
        </Link>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && (p.category === post.category || p.featured))
    .slice(0, 3);

  const title = post.seo?.h1Title || post.title;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedDate,
    dateModified: post.updatedDate || post.publishedDate,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'AetherPix Editorial Team',
      jobTitle: post.author?.role || 'Digital Imaging Specialists',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AetherPix Studio',
      logo: {
        '@type': 'ImageObject',
        url: 'https://aetherpix.studio/icon-192.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.seo?.canonicalUrl || `https://aetherpix.studio/blog/${post.slug}`,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: b.name,
      item: b.url.startsWith('http') ? b.url : `https://aetherpix.studio${b.url}`,
    })),
  };

  return (
    <article className="space-y-10 py-6 max-w-4xl mx-auto px-4 sm:px-6 animate-fade-in">
      {/* Dynamic JSON-LD Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Article Header */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Link
            href={`/blog/category/${slugify(post.category)}`}
            className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"
          >
            {post.category}
          </Link>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {post.readTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {post.publishedDate}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h1>

        {/* Author Header Bar */}
        <div className="flex items-center justify-between py-4 border-y border-slate-200/80 dark:border-slate-800">
          <Link
            href={`/blog/author/${slugify(post.author?.name || 'editorial')}`}
            className="flex items-center gap-3 group"
          >
            {post.author?.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {post.author?.name ? post.author.name[0] : 'A'}
              </div>
            )}
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {post.author?.name || 'AetherPix Team'}
              </div>
              <div className="text-[11px] text-slate-500">{post.author?.role || 'Digital Specialists'}</div>
            </div>
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Article URL copied to clipboard!');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Table of Contents */}
      <TableOfContents html={post.contentHtml} />

      {/* Article Content Body */}
      <ContentRenderer html={post.contentHtml} />

      {/* Article Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <Tag className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-500 mr-1">Tags:</span>
          {post.tags.map((tag, idx) => (
            <Link
              key={idx}
              href={`/blog/tag/${slugify(tag)}`}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Author Bio Footer Box */}
      <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40 flex items-center gap-4">
        {post.author?.avatarUrl ? (
          <img
            src={post.author.avatarUrl}
            alt=""
            className="h-12 w-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shrink-0">
            {post.author?.name ? post.author.name[0] : 'A'}
          </div>
        )}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Written by {post.author?.name || 'AetherPix Team'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {post.author?.role || 'Digital Specialists'} at AetherPix Studio specializing in browser WebAssembly graphics, image compression algorithms, and digital media standards.
          </p>
        </div>
      </div>

      {/* FAQs Accordion if present */}
      {post.faqs && post.faqs.length > 0 && (
        <DynamicFaqAccordion faqs={post.faqs} title="Article FAQs" />
      )}

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4 pt-10 border-t border-slate-200/80 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Related Tutorials & Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-primary transition-all cursor-pointer space-y-2 group"
              >
                <div className="text-[10px] font-bold text-primary uppercase">{r.category}</div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                  {r.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
