import React, { useState } from 'react';
import { BlogService } from '../services/BlogService';
import { BlogPostItem } from '../types/blog';
import { Link } from '../components/common/Link';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { getBreadcrumbsForRoute } from '../config/seoRegistry';
import {
  BookOpen,
  Search,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { slugify } from '../utils/slugify';

export const BlogHubView: React.FC = () => {
  const { currentPath } = useApp();
  const cleanPath = (currentPath || window.location.pathname).split('?')[0].replace(/\/$/, '');

  // Extract category, tag, or author from URL path
  const categoryMatch = cleanPath.match(/\/blog\/category\/([^\/]+)/i);
  const tagMatch = cleanPath.match(/\/blog\/tag\/([^\/]+)/i);
  const authorMatch = cleanPath.match(/\/blog\/author\/([^\/]+)/i);

  const rawCatSlug = categoryMatch ? categoryMatch[1].toLowerCase() : 'all';
  const rawTagSlug = tagMatch ? tagMatch[1].toLowerCase() : '';
  const rawAuthorSlug = authorMatch ? authorMatch[1].toLowerCase() : '';

  const [searchQuery, setSearchQuery] = useState('');

  const publishedPosts = BlogService.getPublishedPosts();
  const breadcrumbs = getBreadcrumbsForRoute('/blog');

  // Categories list
  const categories = Array.from(new Set(publishedPosts.map((p) => p.category)));

  // Filter posts
  const filteredPosts = publishedPosts.filter((post) => {
    if (rawCatSlug !== 'all' && slugify(post.category) !== rawCatSlug) return false;

    if (rawTagSlug) {
      const hasMatchingTag = post.tags.some((t) => slugify(t) === rawTagSlug || t.toLowerCase().includes(rawTagSlug.replace(/-/g, ' ')));
      if (!hasMatchingTag) return false;
    }

    if (rawAuthorSlug) {
      const authorSlug = slugify(post.author.name);
      if (authorSlug !== rawAuthorSlug && !post.author.name.toLowerCase().includes(rawAuthorSlug.replace(/-/g, ' '))) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(q);
      const excerptMatch = post.excerpt.toLowerCase().includes(q);
      const tagMatch = post.tags.some((t) => t.toLowerCase().includes(q) || slugify(t).includes(q));
      return titleMatch || excerptMatch || tagMatch;
    }

    return true;
  });

  const featuredPost = filteredPosts.find((p) => p.featured) || filteredPosts[0];
  const gridPosts = featuredPost
    ? filteredPosts.filter((p) => p.id !== featuredPost.id)
    : filteredPosts;

  return (
    <div className="space-y-12 py-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs tracking-wider uppercase">
          <BookOpen className="h-4 w-4" />
          <span>AetherPix Editorial & Learning Hub</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Guides, Tutorials & Format Insights
        </h1>

        {(rawTagSlug || rawCatSlug !== 'all' || rawAuthorSlug) && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <span>Filtered by: {rawTagSlug ? `#${rawTagSlug}` : rawCatSlug !== 'all' ? rawCatSlug : rawAuthorSlug}</span>
            <Link href="/blog" className="underline font-normal text-slate-500 hover:text-slate-900">Clear</Link>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutorials by keyword or format (e.g., webp, compress, passport)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Link
            href="/blog"
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              rawCatSlug === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Topics ({publishedPosts.length})
          </Link>
          {categories.map((cat) => {
            const catSlug = slugify(cat);
            const isActive = rawCatSlug === catSlug;
            return (
              <Link
                key={cat}
                href={`/blog/category/${catSlug}`}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Article Spotlight Card */}
      {featuredPost && (
        <section className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Featured Spotlight Article</span>
          </div>

          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group relative grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="lg:col-span-7 h-64 lg:h-auto overflow-hidden">
              <img
                src={
                  featuredPost.coverImage ||
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
                }
                alt={featuredPost.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    {featuredPost.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">
                  {featuredPost.title}
                </h2>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {featuredPost.author.avatarUrl ? (
                    <img
                      src={featuredPost.author.avatarUrl}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {featuredPost.author.name[0]}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {featuredPost.author.name}
                  </span>
                </div>

                <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 3-Column Articles Grid */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Latest Articles ({gridPosts.length})
          </h2>
        </div>

        {gridPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
            <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No blog posts found matching your search.
            </p>
            <Link
              href="/blog"
              onClick={() => setSearchQuery('')}
              className="inline-block mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-2xs hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Cover Image */}
                  <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={
                        post.coverImage ||
                        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt={post.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>{post.publishedDate}</span>
                  <span className="text-primary font-semibold group-hover:underline flex items-center gap-1">
                    Read →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
