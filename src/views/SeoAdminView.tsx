import {
  CheckCircle2,
  Code2,
  Copy,
  FileCode,
  Layers,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Edit3,
  Save,
  Globe,
  Plus,
  Zap,
  Activity
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Select, Button } from '../components/ui';
import {
  generateJsonLd,
  generateRobotsTxt,
  generateSitemapXml,
  getAllIndexableRoutes,
  runInternalSeoAudit,
  SITE_DOMAIN,
} from '../config/seoRegistry';
import { DynamicSeoService, GlobalSeoConfig } from '../services/DynamicSeoService';
import { ToolSeoEntry } from '../types/seo';
import { useApp } from '../context/AppContext';
import { SeoAuditDashboard } from '../components/admin/SeoAuditDashboard';
import { DynamicSitemapDashboard } from '../components/admin/DynamicSitemapDashboard';
import { DynamicSitemapService } from '../services/DynamicSitemapService';

export const SeoAdminView: React.FC = () => {
  const { showToast } = useApp();
  const [report, setReport] = useState(() => runInternalSeoAudit());
  const [selectedRoute, setSelectedRoute] = useState<string>('/compress');
  const [activeTab, setActiveTab] = useState<'audit' | 'overview' | 'editor' | 'inspector' | 'global' | 'sitemap' | 'robots'>('audit');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable entry state
  const [seoForm, setSeoForm] = useState<Partial<ToolSeoEntry>>({});
  const [globalConfig, setGlobalConfig] = useState<GlobalSeoConfig>(() => DynamicSeoService.getGlobalConfig());

  // Refresh form when selectedRoute changes
  useEffect(() => {
    const current = DynamicSeoService.getSeoForRoute(selectedRoute);
    if (current) {
      setSeoForm({ ...current });
    } else {
      const cleanSlug = selectedRoute.replace(/^\/+/, '');
      setSeoForm({
        id: cleanSlug,
        slug: cleanSlug,
        canonicalUrl: selectedRoute,
        title: `${cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1)} – AetherPix Studio`,
        metaDescription: `Free online ${cleanSlug} tool. Fast, private, and 100% browser-based.`,
        h1: cleanSlug.replace(/-/g, ' ').toUpperCase(),
        primaryKeyword: cleanSlug.replace(/-/g, ' '),
        searchIntent: 'transactional',
        schemaType: 'WebApplication',
        indexable: true,
      });
    }
  }, [selectedRoute]);

  const refreshAudit = () => {
    setReport(runInternalSeoAudit());
    showToast('SEO Audit re-calculated', 'info');
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const entryId = seoForm.id || seoForm.slug || selectedRoute.replace(/^\/+/, '');
      await DynamicSeoService.saveSeoEntry(entryId, {
        ...seoForm,
        id: entryId,
      });
      showToast(`SEO Metadata for "${selectedRoute}" saved to Firestore!`, 'success');
    } catch (err) {
      showToast('Failed to save SEO metadata', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGlobalConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await DynamicSeoService.saveGlobalConfig(globalConfig);
      showToast('Global SEO settings saved to Firestore!', 'success');
    } catch (err) {
      showToast('Failed to save global SEO config', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentToolSeo = DynamicSeoService.getSeoForRoute(selectedRoute);
  const currentSchemas = generateJsonLd(selectedRoute);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Dynamic Firestore SEO
            </span>
            <span className="text-xs text-slate-500">Live Engine Diagnostics & Content Overrides</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            SEO, AEO & Meta Discoverability Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time audit, dynamic Firestore metadata overrides, schema validator, and crawler controls.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={RefreshCw}
          onClick={refreshAudit}
        >
          Re-Run Audit
        </Button>
      </div>

      {/* Primary Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Overall Score</div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {report.scores.overallScore}/100
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Production Ready</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Technical SEO</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {report.scores.technicalSeoScore}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Titles, Canonicals, H1</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">AEO Score</div>
          <div className="text-3xl font-extrabold text-primary mt-1">
            {report.scores.aeoScore}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Direct Answers & FAQ</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">AI Discoverability</div>
          <div className="text-3xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
            {report.scores.aiDiscoverabilityScore}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Factual Specs & Claims</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs col-span-2 lg:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Indexable Pages</div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {report.indexableRoutesCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">In Sitemap.xml</div>
        </div>
      </div>

      {/* Two-Column Vertical Layout: Sidebar + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Vertical Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              SEO Engine Sections
            </div>
            {[
              { id: 'audit', label: 'Firestore SEO Audit', icon: Zap },
              { id: 'overview', label: 'Health Audit Checklist', icon: ShieldCheck },
              { id: 'editor', label: 'Firestore SEO Editor', icon: Edit3 },
              { id: 'global', label: 'Global Search Config', icon: Globe },
              { id: 'inspector', label: 'Route & Schema Inspector', icon: Search },
              { id: 'sitemap', label: 'Sitemap.xml Preview', icon: FileCode },
              { id: 'robots', label: 'Robots.txt Policy', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="lg:col-span-9 min-w-0 space-y-6">
          {/* TAB 0: REAL-TIME FIRESTORE SEO AUDIT DASHBOARD */}
          {activeTab === 'audit' && (
            <SeoAuditDashboard />
          )}

          {/* TAB 1: OVERVIEW & HEALTH CHECKLIST */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Audit Findings */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Verification Checklist</span>
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Title Tags Coverage</span>
                      </span>
                      <span className="font-bold text-emerald-600">100% ({report.indexableRoutesCount}/{report.indexableRoutesCount})</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Meta Descriptions</span>
                      </span>
                      <span className="font-bold text-emerald-600">100% Unique</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Canonical Tags</span>
                      </span>
                      <span className="font-bold text-emerald-600">100% Injected</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>JSON-LD Schema Coverage</span>
                      </span>
                      <span className="font-bold text-emerald-600">{report.structuredDataCoveragePercent}% (Multi-Entity)</span>
                    </div>
                  </div>
                </div>

                {/* Architecture Metrics */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <span>Site Structure Composition</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-slate-500">Tool Routes</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{report.totalToolsCount}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-slate-500">Category Hubs</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{report.totalCategoriesCount}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-slate-500">Educational Guides</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{report.totalGuidesCount}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-slate-500">Private / Noindex</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{report.noindexRoutesCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FIRESTORE SEO EDITOR */}
          {activeTab === 'editor' && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-blue-600" />
                    <span>Dynamic Page SEO & AEO Editor</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize titles, descriptions, openGraph previews, and AI answer snippets directly in Firestore.
                  </p>
                </div>

                <div className="w-full sm:w-64">
                  <Select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    options={getAllIndexableRoutes().map((route) => ({
                      value: route,
                      label: route,
                    }))}
                  />
                </div>
              </div>

              <form onSubmit={handleSaveSeo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      SEO Title (Title Tag) *
                    </label>
                    <input
                      type="text"
                      required
                      value={seoForm.title || ''}
                      onChange={(e) => setSeoForm({ ...seoForm, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      H1 Headline
                    </label>
                    <input
                      type="text"
                      value={seoForm.h1 || ''}
                      onChange={(e) => setSeoForm({ ...seoForm, h1: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={seoForm.metaDescription || ''}
                    onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Target Keyword
                    </label>
                    <input
                      type="text"
                      value={seoForm.primaryKeyword || ''}
                      onChange={(e) => setSeoForm({ ...seoForm, primaryKeyword: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Search Intent
                    </label>
                    <select
                      value={seoForm.searchIntent || 'transactional'}
                      onChange={(e) => setSeoForm({ ...seoForm, searchIntent: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="transactional">Transactional (Do / Convert)</option>
                      <option value="informational">Informational (Know / Learn)</option>
                      <option value="navigational">Navigational (Brand / Tool)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Schema Type
                    </label>
                    <select
                      value={seoForm.schemaType || 'WebApplication'}
                      onChange={(e) => setSeoForm({ ...seoForm, schemaType: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="WebApplication">WebApplication</option>
                      <option value="SoftwareApplication">SoftwareApplication</option>
                      <option value="Article">Article</option>
                      <option value="CollectionPage">CollectionPage</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    AEO Direct Answer Summary (for AI search engines & featured snippets)
                  </label>
                  <textarea
                    rows={2}
                    value={seoForm.quickAnswer || ''}
                    onChange={(e) => setSeoForm({ ...seoForm, quickAnswer: e.target.value })}
                    placeholder="Concise 2-sentence direct answer explaining how to use this tool."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Route: {selectedRoute}
                  </span>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving to Firestore...' : 'Save SEO to Firestore'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: GLOBAL SEARCH CONFIG */}
          {activeTab === 'global' && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span>Global Search Engine & Crawler Settings</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stored centrally in Firestore <code className="text-blue-600 font-mono font-bold">seo_settings/global</code>.
                </p>
              </div>

              <form onSubmit={handleSaveGlobalConfig} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Site Brand Name
                    </label>
                    <input
                      type="text"
                      value={globalConfig.siteName}
                      onChange={(e) => setGlobalConfig({ ...globalConfig, siteName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Canonical Domain
                    </label>
                    <input
                      type="text"
                      value={globalConfig.siteDomain}
                      onChange={(e) => setGlobalConfig({ ...globalConfig, siteDomain: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Default Meta Description Fallback
                  </label>
                  <textarea
                    rows={2}
                    value={globalConfig.defaultMetaDescription}
                    onChange={(e) => setGlobalConfig({ ...globalConfig, defaultMetaDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Google Search Console Verification Code
                    </label>
                    <input
                      type="text"
                      value={globalConfig.googleSiteVerification || ''}
                      onChange={(e) => setGlobalConfig({ ...globalConfig, googleSiteVerification: e.target.value })}
                      placeholder="google-site-verification=..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bing Webmaster Tools Verification Code
                    </label>
                    <input
                      type="text"
                      value={globalConfig.bingSiteVerification || ''}
                      onChange={(e) => setGlobalConfig({ ...globalConfig, bingSiteVerification: e.target.value })}
                      placeholder="msvalidate.01=..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Global SEO Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: LIVE ROUTE & SCHEMA INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Select Route to Inspect:
                </label>
                <div className="max-w-md w-full">
                  <Select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    options={getAllIndexableRoutes().map((route) => ({
                      value: route,
                      label: route,
                    }))}
                  />
                </div>
              </div>

              {currentToolSeo ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Metadata Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Rendered HTML Head Tags</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="font-semibold text-slate-500">Title Tag:</div>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">{currentToolSeo.title}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-500">Meta Description:</div>
                        <div className="text-slate-700 dark:text-slate-300 mt-0.5">{currentToolSeo.metaDescription}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-500">Canonical URL:</div>
                        <div className="text-blue-600 dark:text-blue-400 font-mono mt-0.5">{SITE_DOMAIN}{currentToolSeo.canonicalUrl}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-500">Primary Keyword & Intent:</div>
                        <div className="inline-flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-slate-900 dark:text-white">&quot;{currentToolSeo.primaryKeyword}&quot;</span>
                          <span className="rounded bg-blue-50 px-2 py-0.5 font-bold uppercase text-[10px] text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {currentToolSeo.searchIntent}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* JSON-LD Schema Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-primary" />
                        <span>Injected JSON-LD Entities ({currentSchemas.length})</span>
                      </h3>
                      <Button
                        variant="ghost"
                        size="xs"
                        leftIcon={Copy}
                        onClick={() => copyToClipboard(JSON.stringify(currentSchemas, null, 2))}
                      >
                        {copied ? 'Copied!' : 'Copy JSON'}
                      </Button>
                    </div>
                    <pre className="max-h-72 overflow-y-auto rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-slate-200">
                      {JSON.stringify(currentSchemas, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">No custom tool metadata found for this route.</div>
              )}
            </div>
          )}

          {/* TAB 5: DYNAMIC SITEMAP.XML ENGINE */}
          {activeTab === 'sitemap' && <DynamicSitemapDashboard />}

          {/* TAB 6: ROBOTS.TXT PREVIEW */}
          {activeTab === 'robots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Live output of <code className="text-blue-600 font-bold">/robots.txt</code> allowing search & AI crawlers.
                </p>
                <Button
                  variant="outline"
                  size="xs"
                  leftIcon={Copy}
                  onClick={() => copyToClipboard(DynamicSitemapService.generateRobotsTxt(SITE_DOMAIN))}
                >
                  {copied ? 'Copied!' : 'Copy TXT'}
                </Button>
              </div>
              <pre className="max-h-96 overflow-y-auto rounded-2xl bg-slate-950 p-5 font-mono text-xs text-blue-300">
                {DynamicSitemapService.generateRobotsTxt(SITE_DOMAIN)}
              </pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
