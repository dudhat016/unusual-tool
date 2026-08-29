import React, { useState, useEffect, useMemo } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { TocHeadingItem } from '../../types/toolCms';

interface TableOfContentsProps {
  html: string;
  className?: string;
}

/**
 * Extracts H2, H3, H4 tags from HTML and builds a structured TOC hierarchy.
 */
export function extractTocHeadings(html: string): TocHeadingItem[] {
  if (!html) return [];

  const headingRegex = /<(h[2-4])\s+[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/\1>/gi;
  const headings: TocHeadingItem[] = [];
  let match: RegExpExecArray | null;

  // Fallback regex if id is missing in raw string
  const rawRegex = /<(h[2-4])\b[^>]*>(.*?)<\/\1>/gi;
  const existingIds = new Set<string>();

  const targetRegex = html.includes('id=') ? headingRegex : rawRegex;

  while ((match = targetRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const level = parseInt(tag.replace('h', ''), 10);
    let id = '';
    let text = '';

    if (targetRegex === headingRegex) {
      id = match[2];
      text = match[3].replace(/<[^>]*>/g, '').trim();
    } else {
      text = match[2].replace(/<[^>]*>/g, '').trim();
      id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      let uniqueId = id || 'heading';
      let counter = 2;
      while (existingIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      existingIds.add(uniqueId);
      id = uniqueId;
    }

    if (text) {
      headings.push({ id, text, level });
    }
  }

  return headings;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ html, className = '' }) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  const headings = useMemo(() => extractTocHeadings(html), [html]);

  // Scroll tracking with IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveId(id);
    setIsOpenMobile(false);

    const targetEl = document.getElementById(id);
    if (targetEl) {
      const yOffset = -90; // Header clearance offset
      const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      targetEl.focus({ preventScroll: true });
    }
  };

  return (
    <nav
      aria-label="Table of contents"
      className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-5 shadow-xs ${className}`}
    >
      {/* Table of Contents Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Table of Contents
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {headings.length} Sections
        </span>
      </div>

      {/* Headings Navigation List */}
      <ul className="space-y-1 text-xs sm:text-sm font-medium">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          const indentClass =
            item.level === 3 ? 'pl-4' : item.level === 4 ? 'pl-8' : 'pl-0';

          return (
            <li key={item.id} className={indentClass}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleLinkClick(e, item.id)}
                className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold dark:bg-primary/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                <span className="truncate">{item.text}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
