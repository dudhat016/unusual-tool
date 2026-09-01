import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  Globe,
  Layers,
  Layout,
  BookOpen,
  RefreshCw,
  Search,
  Send,
  Share2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DynamicSitemapService } from '../../services/DynamicSitemapService';
import { SITE_DOMAIN } from '../../config/seoRegistry';
import { SitemapStats, SitemapUrlEntry, SitemapPingResponse } from '../../types/sitemap';
import { Button } from '../ui';

type SitemapFeedType = 'all' | 'index' | 'tools' | 'blog' | 'images';

export const DynamicSitemapDashboard: React.FC = () => {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [activeFeed, setActiveFeed] = useState<SitemapFeedType>('all');
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [xmlContent, setXmlContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [pingResult, setPingResult] = useState<SitemapPingResponse | null>(null);
  const [showPingModal, setShowPingModal] = useState(false);

  const fetchSitemapData = async (forceFresh = false) => {
    try {
      if (forceFresh) setRefreshing(true);
      else setLoading(true);

      const s = await DynamicSitemapService.getSitemapStats(SITE_DOMAIN, forceFresh);
      setStats(s);

      let xml = '';
      if (activeFeed === 'all') {
        xml = await DynamicSitemapService.generateSitemapXml(SITE_DOMAIN, forceFresh);
      } else if (activeFeed === 'index') {
        xml = await DynamicSitemapService.generateSitemapIndexXml(SITE_DOMAIN, forceFresh);
      } else if (activeFeed === 'tools') {
        xml = await DynamicSitemapService.generateToolsSitemapXml(SITE_DOMAIN, forceFresh);
      } else if (activeFeed === 'blog') {
        xml = await DynamicSitemapService.generateBlogSitemapXml(SITE_DOMAIN, forceFresh);
      } else if (activeFeed === 'images') {
        xml = await DynamicSitemapService.generateImagesSitemapXml(SITE_DOMAIN, forceFresh);
      }

      setXmlContent(xml);
      if (forceFresh) {
        showToast('Successfully refreshed sitemap directly from Firestore!', 'success');
      }
    } catch (e) {
      console.error('Error loading dynamic sitemap', e);
      showToast('Failed to load dynamic sitemap from Firestore', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSitemapData(false);
  }, [activeFeed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    showToast('Sitemap XML copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    DynamicSitemapService.downloadSitemapFile(activeFeed, SITE_DOMAIN);
    showToast(`Downloaded ${getFeedFilename(activeFeed)}`, 'success');
  };

  const handlePingSearchEngines = async () => {
    setPinging(true);
    try {
      const res = await DynamicSitemapService.pingSearchEngines(SITE_DOMAIN);
      setPingResult(res);
      setShowPingModal(true);
      showToast('Search engine ping submitted successfully!', 'success');
    } catch (e) {
      showToast('Search engine ping submission encountered an error', 'error');
    } finally {
      setPinging(false);
    }
  };

  const getFeedFilename = (feed: SitemapFeedType): string => {
    switch (feed) {
      case 'all':
        return 'sitemap.xml';
      case 'index':
        return 'sitemap-index.xml';
      case 'tools':
        return 'sitemap-tools.xml';
      case 'blog':
        return 'sitemap-blog.xml';
      case 'images':
        return 'sitemap-images.xml';
    }
  };

  // Filtered URL entries for the table explorer
  const filteredEntries = useMemo(() => {
    if (!stats) return [];
    return stats.entries.filter((entry) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPath = entry.path.toLowerCase().includes(q);
        const matchTitle = entry.title?.toLowerCase().includes(q);
        if (!matchPath && !matchTitle) return false;
      }

      if (typeFilter !== 'all' && entry.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [stats, searchQuery, typeFilter]);

  const getTypeBadge = (type: SitemapUrlEntry['type']) => {
    const map: Record<string, { label: string; className: string }> = {
      home: { label: 'Home', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
      tool: { label: 'Tool', className: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
      blog: { label: 'Blog', className: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
      category: { label: 'Category', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
      converter: { label: 'Converter', className: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
      target_size: { label: 'Target Size', className: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
      static: { label: 'Static Hub', className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
      legal: { label: 'Trust & Legal', className: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    };
    const item = map[type] || { label: type, className: 'bg-slate-100 text-slate-700' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${item.className}`}>
        {item.label}
      </span>
    );
  };

  const getSourceBadge = (source: SitemapUrlEntry['source']) => {
    if (source === 'firestore_tools') {
      return (
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
          Firestore: tools
        </span>
      );
    }
    if (source === 'firestore_blogs') {
      return (
        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
          Firestore: blogs
        </span>
      );
    }
    if (source === 'firestore_categories') {
      return (
        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
          Firestore: categories
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
        System Routes
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white dark:border-blue-900/40 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
              <Zap className="h-3 w-3" />
              Dynamic Firestore Sitemap Generator
            </span>
            {stats && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Last synced: {new Date(stats.lastGenerated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Dynamic XML Sitemap Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-0.5">
            Continuously queries Firestore collections <code className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 font-mono text-[11px] font-bold text-blue-800 dark:text-blue-300">tools</code>, <code className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 font-mono text-[11px] font-bold text-blue-800 dark:text-blue-300">blogs</code>, and <code className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 font-mono text-[11px] font-bold text-blue-800 dark:text-blue-300">categories</code> to generate compliant XML feeds for Googlebot, Bingbot, and search crawlers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Send}
            onClick={handlePingSearchEngines}
            disabled={pinging}
            className="text-violet-600 border-violet-200 hover:bg-violet-50 dark:text-violet-400 dark:border-violet-800"
          >
            {pinging ? 'Pinging...' : 'Ping Search Engines'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => fetchSitemapData(true)}
            disabled={refreshing || loading}
            className={refreshing ? 'animate-pulse' : ''}
          >
            {refreshing ? 'Refreshing Firestore...' : 'Force Refresh from Firestore'}
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Indexable URLs */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Indexable URLs</span>
              <Globe className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalUrls}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              100% In-Index Ready
            </div>
          </div>

          {/* Active Tools */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Tools</span>
              <Layout className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.toolsCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Firestore 'tools' collection
            </div>
          </div>

          {/* Published Blogs */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Published Blogs</span>
              <BookOpen className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.blogsCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Firestore 'blogs' collection
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Category Hubs</span>
              <Layers className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.categoriesCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Firestore 'categories'
            </div>
          </div>

          {/* Converters & Sizes */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Converters & Sizes</span>
              <Share2 className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.convertersCount + stats.targetSizesCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.convertersCount} conv · {stats.targetSizesCount} sizes
            </div>
          </div>

          {/* Core Static Pages */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Static & Legal</span>
              <FileCode className="h-4 w-4 text-teal-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.staticCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Home, Trust & Pricing
            </div>
          </div>
        </div>
      )}

      {/* Feed Selector & Output Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        {/* Sub-Feed Tabs */}
        <div className="flex flex-wrap items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveFeed('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFeed === 'all'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            sitemap.xml (Full)
          </button>
          <button
            onClick={() => setActiveFeed('index')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFeed === 'index'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            sitemap-index.xml (Master)
          </button>
          <button
            onClick={() => setActiveFeed('tools')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFeed === 'tools'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            sitemap-tools.xml
          </button>
          <button
            onClick={() => setActiveFeed('blog')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFeed === 'blog'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            sitemap-blog.xml
          </button>
          <button
            onClick={() => setActiveFeed('images')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFeed === 'images'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            sitemap-images.xml
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <a
            href={`/${getFeedFilename(activeFeed)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Live Endpoint</span>
          </a>

          <Button
            variant="outline"
            size="xs"
            leftIcon={Download}
            onClick={handleDownload}
            className="text-xs"
          >
            Download XML
          </Button>

          <Button
            variant="primary"
            size="xs"
            leftIcon={copied ? Check : Copy}
            onClick={handleCopy}
            className="text-xs"
          >
            {copied ? 'Copied XML!' : 'Copy XML'}
          </Button>
        </div>
      </div>

      {/* XML Code Preview Block */}
      <div className="rounded-3xl border border-slate-200/80 bg-slate-950 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <FileCode className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-white">/{getFeedFilename(activeFeed)}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">{xmlContent.split('\n').length} lines</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">{(new Blob([xmlContent]).size / 1024).toFixed(1)} KB</span>
          </div>

          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-Served by Express & Firestore</span>
          </div>
        </div>

        <div className="p-4">
          <pre className="max-h-80 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
            {loading ? 'Generating fresh dynamic sitemap XML...' : xmlContent}
          </pre>
        </div>
      </div>

      {/* URL Explorer & Diagnostic Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Dynamic Indexable URL Explorer ({filteredEntries.length} entries)
            </h3>
            <p className="text-xs text-slate-500">
              Inspect each individual URL generated from Firestore documents, including search priorities and crawl frequencies.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search slug or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
            >
              <option value="all">All Types</option>
              <option value="tool">Tools</option>
              <option value="blog">Blogs</option>
              <option value="category">Categories</option>
              <option value="converter">Converters</option>
              <option value="target_size">Target Sizes</option>
              <option value="static">Static</option>
              <option value="legal">Legal</option>
            </select>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">URL Path & Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Firestore Source</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Changefreq</th>
                  <th className="py-3 px-3">Lastmod</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEntries.slice(0, 50).map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {entry.title || entry.path}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-md">
                        {entry.path}
                      </div>
                    </td>
                    <td className="py-3 px-3">{getTypeBadge(entry.type)}</td>
                    <td className="py-3 px-3">{getSourceBadge(entry.source)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {entry.priority}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 capitalize">
                      {entry.changefreq}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {entry.lastmod}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={entry.path}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 inline-flex items-center text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="View Page"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEntries.length > 50 && (
            <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              Showing first 50 of {filteredEntries.length} entries. Use search to find specific URLs.
            </div>
          )}
        </div>
      </div>

      {/* Ping Results Modal */}
      {showPingModal && pingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Search Engine Ping Broadcast
                  </h3>
                  <p className="text-xs text-slate-500">Notified search bots of updated sitemap.xml</p>
                </div>
              </div>
              <button
                onClick={() => setShowPingModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="text-slate-500 font-medium">Broadcasted Target:</div>
                <div className="font-mono text-blue-600 dark:text-blue-400 font-bold break-all">
                  {pingResult.sitemapUrl}
                </div>
              </div>

              <div className="space-y-2">
                {pingResult.results.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30 flex items-start gap-2.5 text-xs"
                  >
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-900 dark:text-emerald-200">
                        {r.engine}
                      </div>
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                        {r.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setShowPingModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
