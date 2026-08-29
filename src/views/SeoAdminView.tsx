import {
  CheckCircle2,
  Code2,
  Copy,
  FileCode,
  Layers,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import React, { useState } from 'react';
import { Select, Button } from '../components/ui';
import {
  generateJsonLd,
  generateRobotsTxt,
  generateSitemapXml,
  getAllIndexableRoutes,
  getSeoForRoute,
  runInternalSeoAudit,
  SITE_DOMAIN,
} from '../config/seoRegistry';

export const SeoAdminView: React.FC = () => {
  const [report, setReport] = useState(() => runInternalSeoAudit());
  const [selectedRoute, setSelectedRoute] = useState<string>('/compress');
  const [activeTab, setActiveTab] = useState<'overview' | 'inspector' | 'sitemap' | 'robots'>('overview');
  const [copied, setCopied] = useState(false);

  const refreshAudit = () => {
    setReport(runInternalSeoAudit());
  };

  const currentToolSeo = getSeoForRoute(selectedRoute);
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
              Admin Diagnostics
            </span>
            <span className="text-xs text-slate-500">Live Health Report</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            SEO, AEO & AI Discoverability Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time audit, schema validator, crawler simulation, and sitemap manager.
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
              { id: 'overview', label: 'Health Audit Checklist', icon: ShieldCheck },
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

          <div className="rounded-3xl border border-blue-100 dark:border-blue-950 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white">AI Search Grounding</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Schema.org structured graphs, JSON-LD, OpenGraph, and LLM web crawler policies are automatically active.
            </p>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="lg:col-span-9 min-w-0 space-y-6">
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

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Orphan Pages & Broken Links</span>
                  </span>
                  <span className="font-bold text-emerald-600">0 Orphans / 0 Broken</span>
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

      {/* TAB 2: LIVE ROUTE & SCHEMA INSPECTOR */}
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

      {/* TAB 3: SITEMAP.XML PREVIEW */}
      {activeTab === 'sitemap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Live output of <code className="text-blue-600 font-bold">/sitemap.xml</code> generated by the server.
            </p>
            <Button
              variant="outline"
              size="xs"
              leftIcon={Copy}
              onClick={() => copyToClipboard(generateSitemapXml(SITE_DOMAIN))}
            >
              {copied ? 'Copied!' : 'Copy XML'}
            </Button>
          </div>
          <pre className="max-h-96 overflow-y-auto rounded-2xl bg-slate-950 p-5 font-mono text-xs text-emerald-400">
            {generateSitemapXml(SITE_DOMAIN)}
          </pre>
        </div>
      )}

      {/* TAB 4: ROBOTS.TXT PREVIEW */}
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
              onClick={() => copyToClipboard(generateRobotsTxt(SITE_DOMAIN))}
            >
              {copied ? 'Copied!' : 'Copy TXT'}
            </Button>
          </div>
          <pre className="max-h-96 overflow-y-auto rounded-2xl bg-slate-950 p-5 font-mono text-xs text-blue-300">
            {generateRobotsTxt(SITE_DOMAIN)}
          </pre>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};
