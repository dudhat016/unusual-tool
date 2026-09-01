import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SaaSDataService } from '../services/SaaSDataService';
import { DynamicCategoryService } from '../services/DynamicCategoryService';
import { CategorySeoEntry } from '../types/seo';
import { ExactTargetSizesGrid } from '../components/common/ExactTargetSizesGrid';
import { PopularConvertersGrid } from '../components/common/PopularConvertersGrid';
import { SmartDropZone } from '../components/common/SmartDropZone';
import { RecentAndFavoritesBar } from '../components/common/RecentAndFavoritesBar';
import {
  Search,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Layers,
  ArrowRight,
  Cpu,
  LayoutGrid,
  FileText,
  Scaling,
  Minimize2,
  RefreshCw,
  Code,
  Youtube,
  Share2,
  Crop,
  ArrowUpRight,
} from 'lucide-react';

import { Link } from '../components/common/Link';
import { DynamicFaqAccordion } from '../components/common/DynamicFaqAccordion';
import { ToolCard } from '../components/common/ToolCard';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'pdf-tools': <FileText className="h-5 w-5 text-red-500" />,
  'youtube-tools': <Youtube className="h-5 w-5 text-red-600" />,
  'image-resizer-tools': <Scaling className="h-5 w-5 text-emerald-500" />,
  'image-compressor-tools': <Minimize2 className="h-5 w-5 text-amber-500" />,
  'image-converter-tools': <RefreshCw className="h-5 w-5 text-blue-500" />,
  'ai-image-tools': <Sparkles className="h-5 w-5 text-primary" />,
  'developer-tools': <Code className="h-5 w-5 text-indigo-500" />,
  'image-editing-tools': <Crop className="h-5 w-5 text-purple-500" />,
  'social-media-tools': <Share2 className="h-5 w-5 text-sky-500" />,
};

export const HomePage: React.FC = () => {
  const { navigate, setIsSearchOpen, tools } = useApp();
  const [usageStats, setUsageStats] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<CategorySeoEntry[]>(() => DynamicCategoryService.getAllCategories());

  useEffect(() => {
    const unsubCat = DynamicCategoryService.subscribe((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    });
    return () => unsubCat();
  }, []);

  useEffect(() => {
    const unsubscribe = SaaSDataService.subscribeToToolUsageStats((stats) => {
      const counts: Record<string, number> = {};
      stats.forEach((s) => {
        counts[s.toolId] = s.usageCount || 0;
      });
      setUsageStats(counts);
    });
    return () => unsubscribe();
  }, []);

  // Compute popular tools dynamically based on real-time usage counts from Firestore
  const popularTools = useMemo(() => {
    const sorted = [...tools];
    sorted.sort((a, b) => {
      const countA = usageStats[a.id] || usageStats[a.slug] || 0;
      const countB = usageStats[b.id] || usageStats[b.slug] || 0;
      if (countA !== countB) return countB - countA;
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });
    return sorted.filter((t) => (usageStats[t.id] || 0) > 0 || t.isPopular || t.isAi);
  }, [tools, usageStats]);

  const homeFaqs = [
    {
      question: 'Is AetherPix Studio really 100% free and private?',
      answer:
        'Yes! All standard utilities (resizing, compression, cropping, format conversion, effects, borders, watermarks, social media formatting, and metadata stripping) operate completely inside your local web browser using client-side HTML5 Canvas technology. Your photos never leave your device.',
    },
    {
      question: 'How does client-side browser processing work without uploading?',
      answer:
        'Modern browsers feature powerful WebAssembly and HTML5 Canvas engines. AetherPix executes native mathematical matrix transforms and quantization directly in your browser RAM, giving you near-instant downloads with zero network latency and maximum privacy.',
    },
    {
      question: 'What image formats are supported?',
      answer:
        'AetherPix supports JPEG, PNG (with full alpha transparency), WebP, GIF, SVG, BMP, AVIF, TIFF, HEIC, ICO, and PDF documents.',
    },
    {
      question: 'Can I process multiple images at the same time?',
      answer:
        'Yes! Use our batch queues on tools like Format Converter or Image Compressor to drop dozens of photos at once and download everything in a single clean ZIP archive.',
    },
  ];

  return (
    <div className="space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 max-w-4xl mx-auto px-4">
        {/* Privacy Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-2xs">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <span>Zero Server Uploads • 100% In-Browser Privacy</span>
        </div>

        {/* Display Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          The Complete Modern <br />
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Image Utility Suite
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Ultra-fast browser-side image processing. Resize, compress, crop, convert formats, create passport photos, and enhance images instantly without losing quality.
        </p>

        {/* Interactive Smart Drop Zone (Competitor Upgrade) */}
        <div className="pt-2">
          <SmartDropZone />
        </div>

        {/* Quick Search & Explore Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full sm:w-80 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-400 shadow-sm hover:border-primary hover:text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-slate-400" />
              <span>Search any tool...</span>
            </div>
            <kbd className="hidden sm:inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/tools"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Explore All Tools</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-left">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/60 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <Cpu className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Local Hardware</p>
              <p className="text-[10px] text-slate-500">HTML5 Canvas Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/60 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white">100% Private</p>
              <p className="text-[10px] text-slate-500">No photos saved</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/60 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Instant Speed</p>
              <p className="text-[10px] text-slate-500">Zero wait queues</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/60 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white">185+ Tools</p>
              <p className="text-[10px] text-slate-500">All-in-one suite</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Favorites Quick Access Bar */}
      <RecentAndFavoritesBar />

      {/* Explore Tool Categories Section */}
      <section className="space-y-6 max-w-6xl mx-auto px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <LayoutGrid className="h-6 w-6 text-primary" />
              <span>Explore Tool Categories</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse dedicated category hubs powered live by Firebase Firestore
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">
            {categories.length} Categories Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const catIcon = CATEGORY_ICONS[cat.id] || <LayoutGrid className="h-5 w-5 text-primary" />;
            const catRoute = `/${cat.slug || cat.id}`;

            return (
              <Link
                key={cat.id}
                href={catRoute}
                className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-primary hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 group-hover:scale-110 transition-transform duration-300">
                      {catIcon}
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {cat.name || cat.h1}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {cat.description || cat.metaDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-primary/90">
                    Explore Category Hub
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Quick Start Grid */}
      <section className="space-y-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Most Popular Tools
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our most frequently used high-speed image utilities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTools.slice(0, 6).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Exact Target Sizes Quick Navigator */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4 max-w-6xl mx-auto">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Exact Target Size Compressors
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            One-click tools to hit strict government portal, job application, and passport upload limits (5KB to 2MB)
          </p>
        </div>
        <ExactTargetSizesGrid title="" />
      </section>

      {/* Popular Image Format Converters */}
      <section className="space-y-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Instant Format Converters
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct high-speed conversion between WebP, PNG, JPG, HEIC, SVG, ICO, and PDF
            </p>
          </div>
          <button
            onClick={() => navigate('/convert')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Formats</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <PopularConvertersGrid />
      </section>

      {/* Why Choose AetherPix Studio */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50/50 p-8 sm:p-12 dark:border-slate-800 dark:bg-slate-900/40 space-y-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Engineered for Unmatched Speed and Absolute Privacy
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Unlike traditional cloud image converters that store and analyze your sensitive pictures on remote servers, AetherPix runs directly on your device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 rounded-2xl bg-white p-6 shadow-2xs dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-400 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero Server Ingestion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your sensitive documents, ID photos, receipts, and personal pictures never leave your device. All calculations happen right in your browser.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl bg-white p-6 shadow-2xs dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero Upload / Download Lag</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Skip waiting for large 4K files to upload over slow connections. Client-side processing happens instantaneously in your local RAM.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl bg-white p-6 shadow-2xs dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Batch & ZIP Workflows</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Convert, resize, or compress dozens of images at once and download everything neatly packaged in a high-speed ZIP archive.
            </p>
          </div>
        </div>
      </section>

      {/* Global Homepage FAQs */}
      <DynamicFaqAccordion
        faqs={homeFaqs}
        subtitle="Everything you need to know about AetherPix Studio"
        className="max-w-3xl mx-auto"
      />
    </div>
  );
};
