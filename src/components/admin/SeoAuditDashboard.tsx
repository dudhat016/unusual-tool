import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Layout,
  Maximize2,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SeoAuditService } from '../../services/SeoAuditService';
import {
  FirestoreAuditItem,
  FirestoreAuditSummary,
  AuditIssueSeverity,
  AuditCategory,
} from '../../types/seoAudit';
import { Button } from '../ui';

export const SeoAuditDashboard: React.FC = () => {
  const { showToast, navigate } = useApp();
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [summary, setSummary] = useState<FirestoreAuditSummary | null>(null);

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'tools' | 'blogs'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'clean'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'meta_description' | 'social_tags' | 'content_quality' | 'faq'>('all');
  const [sortBy, setSortBy] = useState<'score_asc' | 'score_desc' | 'issues_desc' | 'name_asc'>('score_asc');

  // Selected item for Inspection / Quick-Fix Drawer
  const [inspectingItem, setInspectingItem] = useState<FirestoreAuditItem | null>(null);
  const [fixingItem, setFixingItem] = useState(false);

  // Edit form in Inspector
  const [editTitle, setEditTitle] = useState('');
  const [editMetaDesc, setEditMetaDesc] = useState('');
  const [editOgTitle, setEditOgTitle] = useState('');
  const [editOgDesc, setEditOgDesc] = useState('');
  const [editOgImage, setEditOgImage] = useState('');
  const [editKeywords, setEditKeywords] = useState('');

  // Bulk action state
  const [bulkFixing, setBulkFixing] = useState(false);

  const runScan = async (forceFresh = true) => {
    setScanning(true);
    try {
      const res = await SeoAuditService.runFirestoreAudit(forceFresh);
      setSummary(res);
      showToast(
        `Scanned ${res.totalScanned} documents across 'tools' & 'blogs' in Firestore!`,
        'success'
      );
    } catch (err) {
      console.error('Audit scan error', err);
      showToast('Failed to complete Firestore SEO scan', 'error');
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    runScan(false);
  }, []);

  const openInspector = (item: FirestoreAuditItem) => {
    setInspectingItem(item);
    setEditTitle(item.metaStatus.metaTitle);
    setEditMetaDesc(item.metaStatus.metaDescription);
    setEditOgTitle(item.socialStatus.ogTitle || item.metaStatus.metaTitle);
    setEditOgDesc(item.socialStatus.ogDescription || item.metaStatus.metaDescription);
    setEditOgImage(item.socialStatus.ogImage || '');
    setEditKeywords(item.metaStatus.primaryKeyword || '');
  };

  const handleAiAutoFill = () => {
    if (!inspectingItem) return;
    const generated = SeoAuditService.generateOptimizedSeoData(inspectingItem);
    setEditTitle(generated.title);
    setEditMetaDesc(generated.metaDescription);
    setEditOgTitle(generated.ogTitle);
    setEditOgDesc(generated.ogDescription);
    setEditOgImage(generated.ogImage);
    setEditKeywords(generated.keywords.join(', '));
    showToast('Generated AI-optimized metadata and social tags!', 'info');
  };

  const handleSaveFix = async () => {
    if (!inspectingItem) return;
    setFixingItem(true);
    try {
      const keywordsArray = editKeywords.split(',').map((k) => k.trim()).filter(Boolean);
      const success = await SeoAuditService.applyFixToFirestore(inspectingItem, {
        title: editTitle,
        metaDescription: editMetaDesc,
        ogTitle: editOgTitle,
        ogDescription: editOgDesc,
        ogImage: editOgImage,
        keywords: keywordsArray,
      });

      if (success) {
        showToast(`Saved SEO fixes for "${inspectingItem.name}" to Firestore!`, 'success');
        setInspectingItem(null);
        await runScan(false);
      } else {
        showToast('Failed to persist SEO fixes to Firestore', 'error');
      }
    } catch (err) {
      showToast('Error saving SEO updates', 'error');
    } finally {
      setFixingItem(false);
    }
  };

  const handleBulkAutoFixMeta = async () => {
    if (!summary || summary.items.length === 0) return;
    const missingCount = summary.items.filter(
      (i) => !i.metaStatus.hasMetaDescription || i.metaStatus.metaDescriptionStatus === 'missing' || i.metaStatus.metaDescriptionLength < 60
    ).length;

    if (missingCount === 0) {
      showToast('All tools and blogs already have optimized meta descriptions!', 'success');
      return;
    }

    if (
      !window.confirm(
        `Auto-generate and save optimized meta descriptions & social tags to Firestore for ${missingCount} items?`
      )
    ) {
      return;
    }

    setBulkFixing(true);
    try {
      const result = await SeoAuditService.bulkAutoFixMissingMeta(summary.items);
      showToast(
        `Successfully auto-fixed and saved ${result.fixedCount} items to Firestore!`,
        'success'
      );
      await runScan(true);
    } catch (err) {
      showToast('Failed during bulk auto-fix operation', 'error');
    } finally {
      setBulkFixing(false);
    }
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    if (!summary) return [];

    return summary.items
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchSlug = item.slug.toLowerCase().includes(q);
          const matchDesc = item.metaStatus.metaDescription.toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchDesc) return false;
        }

        // Collection filter
        if (collectionFilter === 'tools' && item.type !== 'tool') return false;
        if (collectionFilter === 'blogs' && item.type !== 'blog') return false;

        // Severity filter
        const hasCritical = item.issues.some((i) => i.severity === 'critical');
        const hasWarning = item.issues.some((i) => i.severity === 'warning');
        if (severityFilter === 'critical' && !hasCritical) return false;
        if (severityFilter === 'warning' && !hasWarning && hasCritical) return false;
        if (severityFilter === 'clean' && (hasCritical || hasWarning)) return false;

        // Category filter
        if (categoryFilter === 'meta_description') {
          if (item.metaStatus.hasMetaDescription && item.metaStatus.metaDescriptionStatus === 'optimal') return false;
        }
        if (categoryFilter === 'social_tags') {
          if (item.socialStatus.hasOgTitle && item.socialStatus.hasOgDescription && item.socialStatus.hasOgImage) return false;
        }
        if (categoryFilter === 'content_quality') {
          if (!item.contentStatus.isThinContent && !item.contentStatus.hasPlaceholderText) return false;
        }
        if (categoryFilter === 'faq') {
          if (item.contentStatus.faqCount > 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score_asc') return a.overallScore - b.overallScore;
        if (sortBy === 'score_desc') return b.overallScore - a.overallScore;
        if (sortBy === 'issues_desc') return b.issues.length - a.issues.length;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [summary, searchQuery, collectionFilter, severityFilter, categoryFilter, sortBy]);

  const getScoreColor = (score: number) => {
    if (score >= 88) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
    if (score >= 70) return 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800';
    if (score >= 50) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';
  };

  const getGradeBadge = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'bg-emerald-500 text-white',
      B: 'bg-blue-500 text-white',
      C: 'bg-amber-500 text-white',
      D: 'bg-orange-500 text-white',
      F: 'bg-rose-500 text-white',
    };
    return (
      <span className={`inline-flex items-center justify-center h-6 w-6 rounded-lg text-xs font-black ${colors[grade] || 'bg-slate-500 text-white'}`}>
        {grade}
      </span>
    );
  };

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Scanning Firestore 'tools' & 'blogs' collections...
        </div>
        <p className="text-xs text-slate-500 max-w-sm">
          Analyzing meta descriptions, OpenGraph social sharing tags, and content depth across all published documents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Scanner Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white dark:border-blue-900/40 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
              <Zap className="h-3 w-3" />
              Real-Time Firestore Audit Engine
            </span>
            {summary?.scannedAt && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Last scanned: {new Date(summary.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            SEO, Social Graph & Content Quality Auditor
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-0.5">
            Continuously monitors Firestore <code className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 font-mono text-[11px] font-bold text-blue-800 dark:text-blue-300">tools</code> and <code className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 font-mono text-[11px] font-bold text-blue-800 dark:text-blue-300">blogs</code> documents for missing meta descriptions, absent OpenGraph social tags, thin word counts, and indexing readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Wand2}
            onClick={handleBulkAutoFixMeta}
            disabled={bulkFixing || scanning}
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800"
          >
            {bulkFixing ? 'Fixing...' : 'Bulk Auto-Fix Missing Meta'}
          </Button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => summary && SeoAuditService.exportReportAsCsv(summary)}
              title="Export CSV Report"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => summary && SeoAuditService.exportReportAsJson(summary)}
              title="Export JSON Report"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>JSON</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => runScan(true)}
            disabled={scanning}
            className={scanning ? 'animate-pulse' : ''}
          >
            {scanning ? 'Scanning Firestore...' : 'Run Live Scan'}
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Overall Health */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Overall Health</span>
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {summary.overallHealthScore}%
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              {summary.optimizedCount} Optimized Items
            </div>
          </div>

          {/* Total Assets */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Scanned Assets</span>
              <Layers className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {summary.totalScanned}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {summary.toolsCount} tools · {summary.blogsCount} blogs
            </div>
          </div>

          {/* Critical Flaws */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Critical Issues</span>
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            </div>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${summary.criticalIssuesCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {summary.criticalIssuesCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {summary.warningsCount} warnings
            </div>
          </div>

          {/* Missing Meta Descriptions */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Meta Desc Flaws</span>
              <FileText className="h-4 w-4 text-amber-500" />
            </div>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${summary.missingMetaDescCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {summary.missingMetaDescCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Missing or &lt;60 chars
            </div>
          </div>

          {/* Missing Social Tags */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Social Tag Flaws</span>
              <Share2 className="h-4 w-4 text-violet-500" />
            </div>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${summary.missingSocialTagsCount > 0 ? 'text-violet-600' : 'text-emerald-600'}`}>
              {summary.missingSocialTagsCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Missing OG preview/image
            </div>
          </div>

          {/* Low Quality Content */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Thin Content</span>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${summary.thinContentCount > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
              {summary.thinContentCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {summary.missingFaqsCount} missing FAQs
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tool name, blog title, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Collection Filter */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setCollectionFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                collectionFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({summary?.totalScanned || 0})
            </button>
            <button
              onClick={() => setCollectionFilter('tools')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                collectionFilter === 'tools'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Layout className="h-3 w-3" />
              Tools ({summary?.toolsCount || 0})
            </button>
            <button
              onClick={() => setCollectionFilter('blogs')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                collectionFilter === 'blogs'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <BookOpen className="h-3 w-3" />
              Blogs ({summary?.blogsCount || 0})
            </button>
          </div>

          {/* Issue Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
          >
            <option value="all">All Issue Categories</option>
            <option value="meta_description">Meta Description Issues</option>
            <option value="social_tags">Social Tags (OG) Issues</option>
            <option value="content_quality">Thin / Low-Quality Content</option>
            <option value="faq">Missing FAQs</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
          >
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical Issues Only</option>
            <option value="warning">🟡 Warnings Only</option>
            <option value="clean">🟢 100% Clean / Optimized</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
          >
            <option value="score_asc">Lowest Score First</option>
            <option value="score_desc">Highest Score First</option>
            <option value="issues_desc">Most Issues First</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Audit Items List Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Showing <span className="text-blue-600">{filteredItems.length}</span> of {summary?.totalScanned} documents
          </div>
          <div className="text-[11px] text-slate-400">
            Click "Quick Fix" to generate AI metadata & save directly to Firestore
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              No matching issues found!
            </div>
            <p className="text-xs text-slate-500">
              All inspected assets in the selected filter meet or exceed SEO quality requirements.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredItems.map((item) => {
              const hasCritical = item.issues.some((i) => i.severity === 'critical');
              const hasWarning = item.issues.some((i) => i.severity === 'warning');

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left Column: Asset Info & Issues Badges */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Collection Type Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider ${
                          item.type === 'tool'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        {item.type === 'tool' ? <Layout className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                        {item.type === 'tool' ? 'tools' : 'blogs'}
                      </span>

                      {/* Grade Badge */}
                      {getGradeBadge(item.grade)}

                      {/* Status */}
                      {item.status === 'draft' && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                          Draft / Maint
                        </span>
                      )}

                      {/* Title */}
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h3>

                      {/* Live Link */}
                      <a
                        href={item.route}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center gap-0.5 text-xs font-mono"
                        title="View Live Page"
                      >
                        <span>{item.route}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {/* Meta Description Preview */}
                    <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      {item.metaStatus.metaDescription ? (
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">Meta:</strong>{' '}
                          {item.metaStatus.metaDescription}
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 inline" />
                          Missing Meta Description (Google will auto-generate fallback)
                        </span>
                      )}
                    </div>

                    {/* Issue Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {/* Meta Description Status */}
                      {!item.metaStatus.hasMetaDescription ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          Missing Meta Description
                        </span>
                      ) : item.metaStatus.metaDescriptionLength < 60 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          Short Meta ({item.metaStatus.metaDescriptionLength}ch)
                        </span>
                      ) : null}

                      {/* Social Graph Status */}
                      {!item.socialStatus.hasOgImage ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                          <ImageIcon className="h-2.5 w-2.5" />
                          Missing Social Image
                        </span>
                      ) : null}

                      {/* Thin Content */}
                      {item.contentStatus.isThinContent ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          Thin Content ({item.contentStatus.wordCount} words)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {item.contentStatus.wordCount} words
                        </span>
                      )}

                      {/* FAQs */}
                      {item.contentStatus.faqCount === 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          No FAQs
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {item.contentStatus.faqCount} FAQs
                        </span>
                      )}

                      {/* Clean / Perfect badge */}
                      {!hasCritical && !hasWarning && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                          <Check className="h-2.5 w-2.5" />
                          All SEO Rules Passed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Score & Action Controls */}
                  <div className="flex items-center gap-3 self-end lg:self-center">
                    {/* Score Meter */}
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-xl border text-sm font-black ${getScoreColor(item.overallScore)}`}>
                        {item.overallScore}/100
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {item.issues.length} {item.issues.length === 1 ? 'issue' : 'issues'}
                      </div>
                    </div>

                    {/* Quick Fix Button */}
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={Wand2}
                      onClick={() => openInspector(item)}
                      className="text-xs"
                    >
                      Quick Fix
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inspector / Quick-Fix Modal Drawer */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-2xl ${getScoreColor(inspectingItem.overallScore)}`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {inspectingItem.type === 'tool' ? 'Firestore tools' : 'Firestore blogs'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{inspectingItem.route}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {inspectingItem.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Sparkles}
                  onClick={handleAiAutoFill}
                  className="text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                >
                  AI Auto-Fill Tags
                </Button>
                <button
                  onClick={() => setInspectingItem(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SERP & Social Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Search Snippet Preview */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Search className="h-3 w-3 text-blue-500" />
                      Google Search Result Snippet
                    </span>
                    <span className={editMetaDesc.length > 160 ? 'text-rose-500 font-bold' : 'text-slate-400'}>
                      {editMetaDesc.length}/160 chars
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 font-sans space-y-1">
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
                      https://aetherpix.studio{inspectingItem.route}
                    </div>
                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline line-clamp-1 cursor-pointer">
                      {editTitle || inspectingItem.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {editMetaDesc || (
                        <span className="text-rose-500 italic">No meta description provided.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Card Preview (OpenGraph) */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3 text-violet-500" />
                      Social Sharing Card (OG)
                    </span>
                    <span className="text-slate-400">1200x630px Preview</span>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div className="h-28 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                      {editOgImage ? (
                        <img
                          src={editOgImage}
                          alt="Social preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                          <ImageIcon className="h-6 w-6 mb-1" />
                          <span>No Social Image Set</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">aetherpix.studio</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {editOgTitle || editTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {editOgDesc || editMetaDesc}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Issues List */}
              {inspectingItem.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Detected SEO Diagnostics ({inspectingItem.issues.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {inspectingItem.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                          issue.severity === 'critical'
                            ? 'border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                            : issue.severity === 'warning'
                            ? 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                            : 'border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {issue.severity === 'critical' ? (
                          <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        ) : issue.severity === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                          <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold">{issue.message}</div>
                          <div className="text-[11px] opacity-90 mt-0.5">{issue.recommendation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Editable Fields Form */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Edit Metadata in Firestore
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SEO Title Tag */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      SEO Title Tag (&lt;title&gt;) *
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">
                      Optimal: 50–60 characters. Current: {editTitle.length}
                    </div>
                  </div>

                  {/* Primary Keywords */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Search Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editKeywords}
                      onChange={(e) => setEditKeywords(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Meta Description *
                    </label>
                    <span className={`text-[11px] font-bold ${editMetaDesc.length > 165 || editMetaDesc.length < 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {editMetaDesc.length} / 160 characters (ideal: 130–160)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={editMetaDesc}
                    onChange={(e) => setEditMetaDesc(e.target.value)}
                    placeholder="Write an action-driven 140–160 character description..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {/* OpenGraph Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    OpenGraph Social Image URL (1200x630px)
                  </label>
                  <input
                    type="url"
                    value={editOgImage}
                    onChange={(e) => setEditOgImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
              <button
                onClick={() => {
                  if (inspectingItem.type === 'tool') {
                    navigate(`/admin/tools`);
                  } else {
                    navigate(`/admin/blogs`);
                  }
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Content Editor</span>
                <ExternalLink className="h-3 w-3" />
              </button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setInspectingItem(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={Check}
                  onClick={handleSaveFix}
                  disabled={fixingItem}
                >
                  {fixingItem ? 'Saving to Firestore...' : 'Save Changes to Firestore'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
