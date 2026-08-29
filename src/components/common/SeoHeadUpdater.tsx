import React, { useEffect } from 'react';
import { getSeoForRoute, generateJsonLd, SITE_NAME, SITE_DOMAIN } from '../../config/seoRegistry';
import { getCategoryBySlug } from '../../config/categoryData';
import { BlogService } from '../../services/BlogService';

interface SeoHeadUpdaterProps {
  currentPath: string;
}

export const SeoHeadUpdater: React.FC<SeoHeadUpdaterProps> = ({ currentPath }) => {
  useEffect(() => {
    const clean = currentPath.replace(/\/+$/, '') || '/';
    let title = `${SITE_NAME} – Free Online Image Utility Suite`;
    let description = 'Free in-browser image tools and YouTube creator suite with 100% privacy.';
    let canonical = `${SITE_DOMAIN}${clean === '/' ? '' : clean}`;

    if (clean === '/') {
      title = `${SITE_NAME} – Free Online Image Utilities & YouTube Suite`;
      description = 'All-in-one free online image utility suite: resize, compress, convert, passport photos, watermarks, metadata strippers, YouTube thumbnails, and bulk pipelines.';
    } else {
      const cat = getCategoryBySlug(clean);
      const blogPost = BlogService.getPostBySlug(clean);
      const tool = getSeoForRoute(clean);

      if (blogPost) {
        title = blogPost.seo?.seoTitle || `${blogPost.title} – ${SITE_NAME}`;
        description = blogPost.seo?.metaDescription || blogPost.excerpt;
        canonical = blogPost.seo?.canonicalUrl || `${SITE_DOMAIN}/blog/${blogPost.slug}`;
      } else if (clean === '/blog' || clean === '/blogs') {
        title = `Blog & Educational Tutorials Hub – ${SITE_NAME}`;
        description = 'Step-by-step image optimization guides, format specifications, and YouTube creator tutorials.';
      } else if (cat) {
        title = cat.title;
        description = cat.metaDescription;
      } else if (tool) {
        title = tool.title;
        description = tool.metaDescription;
        canonical = `${SITE_DOMAIN}${tool.canonicalUrl}`;
      } else if (clean === '/about') {
        title = `About Us – ${SITE_NAME}`;
        description = 'Learn about our zero-upload browser-powered image processing engine.';
      } else if (clean === '/privacy') {
        title = `Privacy Policy – ${SITE_NAME}`;
        description = 'Our commitment to zero data storage and 100% in-browser processing.';
      } else if (clean === '/terms') {
        title = `Terms of Service – ${SITE_NAME}`;
        description = 'Terms of service and acceptable usage policies.';
      } else if (clean === '/security') {
        title = `Security Architecture – ${SITE_NAME}`;
        description = 'Deep dive into our zero-upload client-side processing security model.';
      } else if (clean === '/pricing') {
        title = `Pricing & Free Credits – ${SITE_NAME}`;
        description = 'Transparent pricing: 100% free unlimited browser tools and generous AI credits.';
      }
    }

    // 1. Update Document Title
    document.title = title;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update Canonical Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);

    // 4. Update OpenGraph Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonical);

    // 5. Update Dynamic JSON-LD Structured Data
    const schemas = generateJsonLd(clean, SITE_DOMAIN);
    let jsonLdScript = document.getElementById('aetherpix-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'aetherpix-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(schemas);

    // 6. Update Hreflang Tags for Multi-Language SEO
    const SUPPORTED_LOCALES = ['en', 'hi', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'ko', 'zh', 'ar'];
    const cleanPathNoLang = clean.replace(/^\/(en|hi|es|fr|de|pt|it|ja|ko|zh|ar)/i, '') || '/';

    SUPPORTED_LOCALES.forEach((loc) => {
      const hrefLoc = loc === 'en'
        ? `${SITE_DOMAIN}${cleanPathNoLang === '/' ? '' : cleanPathNoLang}`
        : `${SITE_DOMAIN}/${loc}${cleanPathNoLang === '/' ? '' : cleanPathNoLang}`;

      let linkHref = document.querySelector(`link[rel="alternate"][hreflang="${loc}"]`);
      if (!linkHref) {
        linkHref = document.createElement('link');
        linkHref.setAttribute('rel', 'alternate');
        linkHref.setAttribute('hreflang', loc);
        document.head.appendChild(linkHref);
      }
      linkHref.setAttribute('href', hrefLoc);
    });
  }, [currentPath]);

  return null;
};
