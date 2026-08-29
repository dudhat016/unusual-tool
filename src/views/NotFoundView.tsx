import React from 'react';
import { Compass, Search, Home, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from '../components/common/Link';
import { Button } from '../components/ui/Button';

interface NotFoundViewProps {
  path: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ path }) => {
  const { setIsSearchOpen } = useApp();

  const popularTools = [
    { name: 'Compress Image', desc: 'Reduce file size by up to 90% without quality loss', url: '/compress-image' },
    { name: 'Resize Image', desc: 'Custom dimensions in pixels, percentages, or target DPI', url: '/resize-image' },
    { name: 'Convert to JPG / WebP', desc: 'Fast format conversion between WebP, PNG, JPG, and AVIF', url: '/convert/webp-to-jpg' },
    { name: 'Free Online Notepad', desc: 'Browser notepad with rich text, autosave, and PDF export', url: '/online-notepad' },
  ];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 text-center space-y-8">
      {/* 404 Hero Badge & Title */}
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs tracking-wider uppercase">
          <ShieldAlert className="h-4 w-4" />
          <span>Error 404 • Page Not Found</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Lost in Space?
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          The page <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-rose-500 font-mono text-xs">{path}</code> does not exist or has been moved.
        </p>
      </div>

      {/* Action Triggers */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="primary" size="md" leftIcon={Home}>
            Back to Home
          </Button>
        </Link>
        <Button
          variant="outline"
          size="md"
          leftIcon={Search}
          onClick={() => setIsSearchOpen(true)}
        >
          Quick Search (Cmd+K)
        </Button>
      </div>

      {/* Recommended Tools Grid */}
      <div className="w-full max-w-2xl pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-left">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-500">
            <Compass className="h-4 w-4 text-primary" />
            <span>Popular Recommended Tools</span>
          </div>
          <Link href="/tools" className="text-xs text-primary hover:underline font-semibold">
            View All Tools →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {popularTools.map((tool) => (
            <Link
              key={tool.url}
              href={tool.url}
              className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-primary/50 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {tool.name}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
