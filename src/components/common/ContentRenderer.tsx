import React, { useMemo } from 'react';

interface ContentRendererProps {
  html: string;
  className?: string;
}

/**
 * Utility to convert heading text into a safe, clean URL slug anchor ID.
 * Handles duplicate headings, special characters, unicode, and spaces.
 */
export function slugifyHeadingText(text: string, existingIds: Set<string>): string {
  const clean = text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // Strip inline tags
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-');

  let baseId = clean || 'heading';
  let uniqueId = baseId;
  let counter = 2;

  while (existingIds.has(uniqueId)) {
    uniqueId = `${baseId}-${counter}`;
    counter++;
  }

  existingIds.add(uniqueId);
  return uniqueId;
}

/**
 * Sanitizes and injects stable heading IDs into raw HTML content.
 */
export function processAndSanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  // Basic security sanitization: Strip dangerous script tags and event handlers
  let sanitized = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:[^\s"']*/gi, '');

  const existingIds = new Set<string>();

  // Regex match H2, H3, H4 tags and inject ID if not present
  sanitized = sanitized.replace(/<(h[2-4])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, innerText) => {
    // If ID already exists in attributes, preserve it
    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    let id = '';
    if (idMatch && idMatch[1]) {
      id = idMatch[1];
      existingIds.add(id);
    } else {
      id = slugifyHeadingText(innerText, existingIds);
    }

    // Filter out existing id attribute from attrs if any to prevent duplicate id attr
    const cleanAttrs = attrs.replace(/\s*id=["']([^"']+)["']/gi, '');
    return `<${tag} id="${id}" ${cleanAttrs.trim()}>${innerText}</${tag}>`;
  });

  return sanitized;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ html, className = '' }) => {
  const processedHtml = useMemo(() => processAndSanitizeHtml(html), [html]);

  return (
    <article
      className={`max-w-none text-slate-900 dark:text-slate-100
        [&_h2]:text-2xl [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-slate-200 dark:[&_h2]:border-slate-800 [&_h2]:pb-2 [&_h2]:scroll-mt-24
        [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-slate-800 dark:[&_h3]:text-slate-100 [&_h3]:mt-6 [&_h3]:mb-2.5 [&_h3]:scroll-mt-24
        [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-slate-700 dark:[&_h4]:text-slate-200 [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:scroll-mt-24
        [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_p]:my-3.5 [&_p]:text-slate-700 dark:[&_p]:text-slate-300
        [&_strong]:font-black [&_strong]:text-slate-900 dark:[&_strong]:text-white
        [&_em]:italic [&_em]:text-slate-800 dark:[&_em]:text-slate-200
        [&_u]:underline [&_u]:decoration-primary [&_u]:underline-offset-2
        [&_s]:line-through [&_s]:opacity-75
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-2 [&_ul]:text-slate-700 dark:[&_ul]:text-slate-300
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-2 [&_ol]:text-slate-700 dark:[&_ol]:text-slate-300
        [&_li]:pl-1
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 dark:[&_blockquote]:bg-slate-900/60 [&_blockquote]:py-3.5 [&_blockquote]:px-5 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-slate-800 dark:[&_blockquote]:text-slate-200
        [&_code]:font-mono [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_code]:font-bold
        [&_pre]:font-mono [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:text-xs
        [&_a]:text-primary [&_a]:underline [&_a]:font-bold hover:[&_a]:opacity-80
        [&_table]:w-full [&_table]:my-6 [&_table]:text-left [&_table]:text-xs sm:[&_table]:text-sm [&_table]:border-collapse [&_table]:rounded-xl [&_table]:overflow-hidden
        [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800 [&_th]:p-3 [&_th]:font-extrabold [&_th]:border [&_th]:border-slate-200 dark:[&_th]:border-slate-700 [&_th]:text-slate-900 dark:[&_th]:text-white
        [&_td]:p-3 [&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-slate-800 [&_td]:text-slate-700 dark:[&_td]:text-slate-300
        ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};
