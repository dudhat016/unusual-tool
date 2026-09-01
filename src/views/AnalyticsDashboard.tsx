import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import { SaaSDataService } from '../services/SaaSDataService';
import { DynamicToolService } from '../services/DynamicToolService';
import { ToolUsageStatItem } from '../types/admin';
import { ProcessingJobRecord, UserProfile, CreditLedgerRecord, SystemErrorLog } from '../types/saas';
import { formatFileSize } from '../engine/imageEngine';
import { DEFAULT_PLANS } from '../config/plans';
import {
  Activity,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  RefreshCw,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  Layers,
  Clock,
  ArrowUpRight,
  Database,
  SlidersHorizontal,
  ExternalLink,
  Users,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  Radio,
  FileText,
  Copy,
  Check,
  Calendar,
  X,
  Eye,
  Server,
  HardDrive,
  Cpu
} from 'lucide-react';

interface AnalyticsDashboardProps {
  users?: UserProfile[];
  jobs?: ProcessingJobRecord[];
  ledger?: CreditLedgerRecord[];
  errorLogs?: SystemErrorLog[];
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  navigate?: (path: string) => void;
}

type AnalyticsSubTab = 'tools' | 'users' | 'financial' | 'reliability' | 'formats';
type TimeRange = 'today' | '7d' | '30d' | '90d' | 'all';

const CATEGORY_COLORS: Record<string, string> = {
  image: '#6366f1', // Indigo
  converter: '#8b5cf6', // Purple
  pdf: '#ec4899', // Pink
  ai: '#3b82f6', // Blue
  ocr: '#10b981', // Emerald
  utilities: '#f59e0b', // Amber
  social: '#06b6d4', // Cyan
  general: '#64748b' // Slate
};

const PALETTE = ['#6366f1', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  users: initialUsers = [],
  jobs: initialJobs = [],
  ledger: initialLedger = [],
  errorLogs: initialErrorLogs = [],
  showToast,
  navigate
}) => {
  // Live State from Subscriptions or Props
  const [toolStats, setToolStats] = useState<ToolUsageStatItem[]>([]);
  const [liveJobs, setLiveJobs] = useState<ProcessingJobRecord[]>(initialJobs);
  const [liveUsers, setLiveUsers] = useState<UserProfile[]>(initialUsers);
  const [liveLedger, setLiveLedger] = useState<CreditLedgerRecord[]>(initialLedger);
  const [liveLogs, setLiveLogs] = useState<SystemErrorLog[]>(initialErrorLogs);

  // UI State
  const [activeTab, setActiveTab] = useState<AnalyticsSubTab>('tools');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'usage' | 'successRate' | 'data' | 'speed'>('usage');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [chartMetric, setChartMetric] = useState<'runs' | 'successVsFail' | 'data'>('runs');

  // Selected Tool Modal for granular drilldown
  const [inspectedTool, setInspectedTool] = useState<ToolUsageStatItem | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Synchronize with parent props when they change
  useEffect(() => {
    if (initialJobs.length > 0) setLiveJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    if (initialUsers.length > 0) setLiveUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    if (initialLedger.length > 0) setLiveLedger(initialLedger);
  }, [initialLedger]);

  useEffect(() => {
    if (initialErrorLogs.length > 0) setLiveLogs(initialErrorLogs);
  }, [initialErrorLogs]);

  // Real-Time Firestore Listeners Setup
  useEffect(() => {
    if (!isLiveStreaming) return;

    // 1. Subscribe to Tool Usage Stats
    const unsubToolStats = SaaSDataService.subscribeToToolUsageStats((stats) => {
      if (stats && stats.length > 0) {
        setToolStats(stats);
        setLastSyncTime(new Date());
        setLoading(false);
      } else {
        // If empty in Firestore, trigger initial load/bootstrap
        loadInitialStats();
      }
    });

    // 2. Subscribe to Processing Jobs
    const unsubJobs = SaaSDataService.subscribeToAllJobs((jobs) => {
      if (jobs) {
        setLiveJobs(jobs);
        setLastSyncTime(new Date());
      }
    });

    // 3. Subscribe to Users
    const unsubUsers = SaaSDataService.subscribeToAllUsers((users) => {
      if (users) {
        setLiveUsers(users);
      }
    });

    // 4. Subscribe to Credit Ledger
    const unsubLedger = SaaSDataService.subscribeToAllLedger((records) => {
      if (records) {
        setLiveLedger(records);
      }
    });

    // 5. Subscribe to Error Logs
    const unsubErrors = SaaSDataService.subscribeToAllErrorLogs((logs) => {
      if (logs) {
        setLiveLogs(logs);
      }
    });

    return () => {
      unsubToolStats();
      unsubJobs();
      unsubUsers();
      unsubLedger();
      unsubErrors();
    };
  }, [isLiveStreaming]);

  // Initial load from Firestore
  const loadInitialStats = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setSyncing(true);
    else setLoading(true);

    try {
      let stats = await SaaSDataService.getToolUsageStats();

      // If no Firestore records exist yet, generate initial zero-state items for tools
      if (!stats || stats.length === 0) {
        const catalog = DynamicToolService.getAllTools();
        const initialStats: ToolUsageStatItem[] = catalog.map((tool) => {
          const toolJobs = liveJobs.filter((j) => j.toolId === tool.id || j.toolName === tool.name);
          const toolJobCount = toolJobs.length;
          const successfulJobs = toolJobs.filter((j) => j.status === 'completed').length;
          const failedJobs = toolJobs.filter((j) => j.status === 'failed').length;
          const bytesProcessed = toolJobs.reduce((sum, j) => sum + (j.originalSize || 0), 0);
          const totalDuration = toolJobs.reduce((sum, j) => sum + (j.processingTimeMs || 0), 0);
          const avgDuration = toolJobCount > 0 ? Math.round(totalDuration / toolJobCount) : 0;
          const lastJobTimestamp = toolJobs.length > 0 ? Math.max(...toolJobs.map((j) => j.timestamp || 0)) : 0;

          return {
            id: tool.id,
            toolId: tool.id,
            toolName: tool.name,
            category: tool.category || (tool.isAi ? 'ai' : 'image'),
            usageCount: toolJobCount,
            successCount: successfulJobs,
            failureCount: failedJobs,
            totalBytesProcessed: bytesProcessed,
            avgDurationMs: avgDuration,
            lastUsedAt: lastJobTimestamp,
            isAi: tool.isAi || false
          };
        });

        stats = initialStats;
      }

      setToolStats(stats);
      setLastSyncTime(new Date());
      if (forceRefresh && showToast) {
        showToast('Analytics synchronized with Firestore', 'success');
      }
    } catch (e) {
      console.error('Failed to load tool usage counts from Firestore', e);
      if (showToast) showToast('Failed to load analytics from Firestore', 'error');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [liveJobs, showToast]);

  useEffect(() => {
    loadInitialStats();
  }, [loadInitialStats]);

  // Timeframe filter cutoff timestamp
  const timeframeCutoff = useMemo(() => {
    const now = Date.now();
    switch (timeRange) {
      case 'today':
        return now - 24 * 60 * 60 * 1000;
      case '7d':
        return now - 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return now - 30 * 24 * 60 * 60 * 1000;
      case '90d':
        return now - 90 * 24 * 60 * 60 * 1000;
      case 'all':
      default:
        return 0;
    }
  }, [timeRange]);

  // Filtered data records according to selected timeframe
  const filteredJobs = useMemo(() => {
    if (timeframeCutoff === 0) return liveJobs;
    return liveJobs.filter((j) => (j.timestamp || 0) >= timeframeCutoff);
  }, [liveJobs, timeframeCutoff]);

  const filteredLedger = useMemo(() => {
    if (timeframeCutoff === 0) return liveLedger;
    return liveLedger.filter((l) => (l.timestamp || 0) >= timeframeCutoff);
  }, [liveLedger, timeframeCutoff]);

  const filteredLogs = useMemo(() => {
    if (timeframeCutoff === 0) return liveLogs;
    return liveLogs.filter((l) => (l.timestamp || 0) >= timeframeCutoff);
  }, [liveLogs, timeframeCutoff]);

  // Filtered and Sorted Tool Stats
  const filteredStats = useMemo(() => {
    return toolStats
      .filter((t) => {
        const matchesCategory =
          selectedCategory === 'all' ||
          t.category === selectedCategory ||
          (selectedCategory === 'ai' && t.isAi);
        const matchesSearch =
          !searchQuery.trim() ||
          t.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.toolId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'usage') {
          diff = b.usageCount - a.usageCount;
        } else if (sortBy === 'successRate') {
          const rateA = a.usageCount > 0 ? (a.successCount / a.usageCount) * 100 : 100;
          const rateB = b.usageCount > 0 ? (b.successCount / b.usageCount) * 100 : 100;
          diff = rateB - rateA;
        } else if (sortBy === 'data') {
          diff = b.totalBytesProcessed - a.totalBytesProcessed;
        } else if (sortBy === 'speed') {
          diff = a.avgDurationMs - b.avgDurationMs;
        }
        return sortOrder === 'desc' ? diff : -diff;
      });
  }, [toolStats, selectedCategory, searchQuery, sortBy, sortOrder]);

  // Aggregate Key Performance Metrics
  const aggregateMetrics = useMemo(() => {
    const totalRuns = toolStats.reduce((sum, item) => sum + item.usageCount, 0);
    const totalSuccess = toolStats.reduce((sum, item) => sum + item.successCount, 0);
    const totalFailures = toolStats.reduce((sum, item) => sum + item.failureCount, 0);
    const totalBytes = toolStats.reduce((sum, item) => sum + item.totalBytesProcessed, 0);
    const avgDuration =
      totalRuns > 0
        ? Math.round(toolStats.reduce((sum, item) => sum + item.avgDurationMs * item.usageCount, 0) / totalRuns)
        : 0;

    const topTool = [...toolStats].sort((a, b) => b.usageCount - a.usageCount)[0];
    const overallSuccessRate = totalRuns > 0 ? ((totalSuccess / totalRuns) * 100).toFixed(1) : '100.0';
    const aiRuns = toolStats.filter((t) => t.isAi).reduce((sum, t) => sum + t.usageCount, 0);

    // Real user aggregates
    const totalUsers = liveUsers.length;
    const proUsers = liveUsers.filter((u) => u.plan === 'pro').length;
    const businessUsers = liveUsers.filter((u) => u.plan === 'business').length;
    const freeUsers = liveUsers.filter((u) => !u.plan || u.plan === 'free').length;

    // Monthly Recurring Revenue (MRR)
    const proPrice = DEFAULT_PLANS.pro?.priceMonthly ?? 12;
    const bizPrice = DEFAULT_PLANS.business?.priceMonthly ?? 39;
    const mrr = proUsers * proPrice + businessUsers * bizPrice;
    const arr = mrr * 12;
    const arpu = totalUsers > 0 ? (mrr / totalUsers).toFixed(2) : '0.00';

    // Credits usage aggregates
    const totalCreditsConsumed = filteredLedger
      .filter((l) => l.amount < 0)
      .reduce((sum, l) => sum + Math.abs(l.amount), 0);

    const totalCreditsPurchased = filteredLedger
      .filter((l) => l.transactionType === 'purchase' || (l.amount > 0 && l.description?.includes('package')))
      .reduce((sum, l) => sum + l.amount, 0);

    return {
      totalRuns,
      totalSuccess,
      totalFailures,
      totalBytes,
      avgDuration,
      topTool,
      overallSuccessRate,
      aiRuns,
      totalUsers,
      proUsers,
      businessUsers,
      freeUsers,
      mrr,
      arr,
      arpu,
      totalCreditsConsumed,
      totalCreditsPurchased
    };
  }, [toolStats, liveUsers, filteredLedger]);

  // Top 10 Tools for Bar Chart
  const topToolsChartData = useMemo(() => {
    return [...toolStats]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map((t) => ({
        name: t.toolName.length > 16 ? t.toolName.substring(0, 14) + '...' : t.toolName,
        fullName: t.toolName,
        runs: t.usageCount,
        success: t.successCount,
        failures: t.failureCount,
        dataMB: parseFloat((t.totalBytesProcessed / (1024 * 1024)).toFixed(1)),
        avgTimeMs: t.avgDurationMs,
        category: t.category,
        successRate: t.usageCount > 0 ? Math.round((t.successCount / t.usageCount) * 100) : 100
      }));
  }, [toolStats]);

  // Category Distribution for Pie / Donut Chart
  const categoryChartData = useMemo(() => {
    const map: Record<string, { count: number; bytes: number; name: string }> = {};

    toolStats.forEach((t) => {
      const cat = t.category || 'general';
      if (!map[cat]) {
        map[cat] = {
          count: 0,
          bytes: 0,
          name: cat.toUpperCase()
        };
      }
      map[cat].count += t.usageCount;
      map[cat].bytes += t.totalBytesProcessed;
    });

    return Object.entries(map).map(([key, val], idx) => ({
      category: key,
      name: val.name,
      value: val.count,
      dataMB: Math.round(val.bytes / (1024 * 1024)),
      color: CATEGORY_COLORS[key] || PALETTE[idx % PALETTE.length]
    }));
  }, [toolStats]);

  // Time-Series Activity Trend Data
  const timeSeriesTrendData = useMemo(() => {
    const intervals = timeRange === 'today' ? 12 : timeRange === '7d' ? 7 : timeRange === '30d' ? 15 : 20;
    const result = [];
    const now = new Date();

    for (let i = intervals - 1; i >= 0; i--) {
      const d = new Date(
        now.getTime() - i * (timeRange === 'today' ? 2 * 3600 * 1000 : 24 * 3600 * 1000)
      );
      const label =
        timeRange === 'today'
          ? `${d.getHours()}:00`
          : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      // Match actual live jobs if available
      const intervalStart = d.getTime() - (timeRange === 'today' ? 2 * 3600 * 1000 : 24 * 3600 * 1000);
      const intervalEnd = d.getTime();

      const matchedJobs = liveJobs.filter(
        (j) => j.timestamp && j.timestamp >= intervalStart && j.timestamp <= intervalEnd
      );

      const totalCount = matchedJobs.length;
      const aiCount = matchedJobs.filter((j) => j.processorType === 'ai').length;
      const failCount = matchedJobs.filter((j) => j.status === 'failed').length;

      result.push({
        time: label,
        total: totalCount,
        standard: Math.max(0, totalCount - aiCount),
        ai: aiCount,
        failures: failCount,
        success: Math.max(0, totalCount - failCount)
      });
    }

    return result;
  }, [timeRange, liveJobs]);

  // Credit Consumption Timeline Data
  const creditConsumptionData = useMemo(() => {
    const intervals = timeRange === 'today' ? 8 : timeRange === '7d' ? 7 : 14;
    const result = [];
    const now = new Date();

    for (let i = intervals - 1; i >= 0; i--) {
      const d = new Date(
        now.getTime() - i * (timeRange === 'today' ? 3 * 3600 * 1000 : 24 * 3600 * 1000)
      );
      const label =
        timeRange === 'today'
          ? `${d.getHours()}:00`
          : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      const intervalStart = d.getTime() - (timeRange === 'today' ? 3 * 3600 * 1000 : 24 * 3600 * 1000);
      const intervalEnd = d.getTime();

      const periodLedger = liveLedger.filter(
        (l) => l.timestamp && l.timestamp >= intervalStart && l.timestamp <= intervalEnd
      );

      const usageCredits = periodLedger
        .filter((l) => l.amount < 0)
        .reduce((sum, l) => sum + Math.abs(l.amount), 0);

      const topupCredits = periodLedger
        .filter((l) => l.amount > 0)
        .reduce((sum, l) => sum + l.amount, 0);

      result.push({
        time: label,
        consumed: usageCredits,
        purchased: topupCredits
      });
    }

    return result;
  }, [timeRange, liveLedger]);

  // User Plan Distribution Data
  const userPlanDistributionData = useMemo(() => {
    return [
      { name: 'Free Tier', value: aggregateMetrics.freeUsers, color: '#64748b' },
      { name: 'Pro Plan ($12/mo)', value: aggregateMetrics.proUsers, color: '#6366f1' },
      { name: 'Business Plan ($39/mo)', value: aggregateMetrics.businessUsers, color: '#ec4899' }
    ];
  }, [aggregateMetrics]);

  // Format Popularity Distribution Data
  const formatPopularityData = useMemo(() => {
    const formatCounts: Record<string, number> = {
      WEBP: 0,
      PNG: 0,
      JPEG: 0,
      PDF: 0,
      AVIF: 0,
      SVG: 0,
      GIF: 0
    };

    liveJobs.forEach((job) => {
      const ext = job.fileName?.split('.').pop()?.toUpperCase() || 'WEBP';
      if (formatCounts[ext] !== undefined) formatCounts[ext]++;
      else formatCounts[ext] = 1;
    });

    return Object.entries(formatCounts)
      .filter(([, count]) => count > 0)
      .map(([ext, count]) => ({
        format: ext,
        count,
        color:
          ext === 'WEBP'
            ? '#6366f1'
            : ext === 'PNG'
            ? '#3b82f6'
            : ext === 'JPEG'
            ? '#10b981'
            : ext === 'PDF'
            ? '#ec4899'
            : ext === 'AVIF'
            ? '#f59e0b'
            : '#8b5cf6'
      }))
      .sort((a, b) => b.count - a.count);
  }, [liveJobs]);

  // Error Breakdown Categorization
  const errorBreakdownData = useMemo(() => {
    const errorMap: Record<string, { count: number; label: string }> = {
      timeout: { count: 0, label: 'Execution Timeout' },
      format: { count: 0, label: 'Invalid File Format' },
      rate_limit: { count: 0, label: 'AI Rate Limit Exceeded' },
      client: { count: 0, label: 'Client Canvas Crash' },
      network: { count: 0, label: 'Network Disconnection' }
    };

    filteredLogs.forEach((log) => {
      const msg = (log.errorMessage || '').toLowerCase();
      if (msg.includes('timeout')) errorMap.timeout.count++;
      else if (msg.includes('format') || msg.includes('corrupt')) errorMap.format.count++;
      else if (msg.includes('rate') || msg.includes('429') || msg.includes('quota')) errorMap.rate_limit.count++;
      else if (msg.includes('network') || msg.includes('fetch')) errorMap.network.count++;
      else errorMap.client.count++;
    });

    return Object.entries(errorMap)
      .filter(([, val]) => val.count > 0)
      .map(([key, val]) => ({
        key,
        label: val.label,
        count: val.count,
        color:
          key === 'rate_limit'
            ? '#f43f5e'
            : key === 'timeout'
            ? '#f59e0b'
            : key === 'format'
            ? '#ec4899'
            : '#3b82f6'
      }));
  }, [filteredLogs]);

  // Speed vs SLA Composed Chart Data
  const performanceChartData = useMemo(() => {
    return [...toolStats]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 8)
      .map((t) => ({
        toolName: t.toolName.length > 14 ? t.toolName.substring(0, 12) + '..' : t.toolName,
        fullName: t.toolName,
        durationMs: t.avgDurationMs,
        slaRate: t.usageCount > 0 ? parseFloat(((t.successCount / t.usageCount) * 100).toFixed(1)) : 100,
        volume: t.usageCount
      }));
  }, [toolStats]);

  // Export Analytics to CSV
  const handleExportCSV = (type: 'tools' | 'jobs' | 'ledger' = 'tools') => {
    if (type === 'tools') {
      if (toolStats.length === 0) return;
      const headers = [
        'Tool ID',
        'Tool Name',
        'Category',
        'Usage Count',
        'Success Count',
        'Failure Count',
        'Success Rate %',
        'Total Data Processed (MB)',
        'Avg Processing Time (ms)',
        'Is AI Neural',
        'Last Executed'
      ];
      const rows = filteredStats.map((t) => [
        t.toolId,
        `"${t.toolName.replace(/"/g, '""')}"`,
        t.category,
        t.usageCount,
        t.successCount,
        t.failureCount,
        t.usageCount > 0 ? ((t.successCount / t.usageCount) * 100).toFixed(1) : '100',
        (t.totalBytesProcessed / (1024 * 1024)).toFixed(2),
        t.avgDurationMs,
        t.isAi ? 'Yes' : 'No',
        new Date(t.lastUsedAt).toISOString()
      ]);
      downloadCsv(headers, rows, `aetherpix-tool-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    } else if (type === 'jobs') {
      if (filteredJobs.length === 0) return;
      const headers = ['Job ID', 'User ID', 'Tool Name', 'Processor', 'Status', 'Size (Bytes)', 'Duration (ms)', 'Timestamp'];
      const rows = filteredJobs.map((j) => [
        j.id,
        j.userId,
        `"${(j.toolName || j.toolId).replace(/"/g, '""')}"`,
        j.processorType,
        j.status,
        j.originalSize || 0,
        j.processingTimeMs || 0,
        new Date(j.timestamp || Date.now()).toISOString()
      ]);
      downloadCsv(headers, rows, `aetherpix-job-logs-${new Date().toISOString().split('T')[0]}.csv`);
    } else if (type === 'ledger') {
      if (filteredLedger.length === 0) return;
      const headers = ['Transaction ID', 'User ID', 'Type', 'Amount Delta', 'Balance After', 'Description', 'Timestamp'];
      const rows = filteredLedger.map((l) => [
        l.id,
        l.userId,
        l.transactionType,
        l.amount,
        l.balanceAfter,
        `"${(l.description || '').replace(/"/g, '""')}"`,
        new Date(l.timestamp || Date.now()).toISOString()
      ]);
      downloadCsv(headers, rows, `aetherpix-credit-ledger-${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  const downloadCsv = (headers: string[], rows: (string | number)[][], fileName: string) => {
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Exported ${fileName}`, 'success');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 2000);
    if (showToast) showToast('Copied to clipboard', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Real-Time Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              SaaS Analytics & Performance Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time Firestore telemetry, execution throughput, revenue run-rate, error SLAs, and user retention metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Streaming Toggle Indicator */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            title={isLiveStreaming ? 'Real-time WebSocket active (Click to pause)' : 'Real-time paused (Click to resume)'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              isLiveStreaming
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isLiveStreaming && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLiveStreaming ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </span>
            <span>{isLiveStreaming ? 'Live Stream Active' : 'Stream Paused'}</span>
          </button>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            {(['today', '7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range === 'today'
                  ? 'Today'
                  : range === '7d'
                  ? '7D'
                  : range === '30d'
                  ? '30D'
                  : range === '90d'
                  ? '90D'
                  : 'All'}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadInitialStats(true)}
            disabled={syncing || loading}
            title="Refresh metrics from Firestore"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={() => handleExportCSV(activeTab === 'users' ? 'jobs' : activeTab === 'financial' ? 'ledger' : 'tools')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'tools'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Tool Telemetry & Throughput</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>User Growth & Subscriptions</span>
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'financial'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>Credits Economy & MRR</span>
        </button>

        <button
          onClick={() => setActiveTab('reliability')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'reliability'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>SLA Health & Error Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('formats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'formats'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Formats & Compression</span>
        </button>
      </div>

      {/* Global Top KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Tool Runs */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tool Runs</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {aggregateMetrics.totalRuns.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
              <ArrowUpRight className="h-3 w-3 inline" />
              {aggregateMetrics.totalSuccess.toLocaleString()} Success
            </span>
            <span>•</span>
            <span className="text-rose-500">{aggregateMetrics.totalFailures} Failed</span>
          </div>
        </div>

        {/* Metric 2: Monthly Recurring Revenue (MRR) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Run-Rate (MRR)</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            ${aggregateMetrics.mrr}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              ${aggregateMetrics.arr} ARR Projected
            </span>
            <span>•</span>
            <span>${aggregateMetrics.arpu} ARPU</span>
          </div>
        </div>

        {/* Metric 3: Data Processed & AI Operations */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Data Transformed</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {formatFileSize(aggregateMetrics.totalBytes)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-slate-500">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>{aggregateMetrics.aiRuns.toLocaleString()} AI Neural Operations</span>
          </div>
        </div>

        {/* Metric 4: Success SLA */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Success SLA</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {aggregateMetrics.overallSuccessRate}%
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-slate-500">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>Avg Latency: {aggregateMetrics.avgDuration}ms</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TOOL TELEMETRY & THROUGHPUT */}
      {/* ========================================================================= */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          {/* Charts Row 1: Top 10 Tools & Category Share */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top 10 Tools Bar Chart */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                    <span>Top 10 Tools by Invocations</span>
                  </h3>
                  <p className="text-xs text-slate-500">Ranked by real-time execution counts recorded in Firestore.</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setChartMetric('runs')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      chartMetric === 'runs'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Total Runs
                  </button>
                  <button
                    onClick={() => setChartMetric('successVsFail')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      chartMetric === 'successVsFail'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Success vs Fail
                  </button>
                  <button
                    onClick={() => setChartMetric('data')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      chartMetric === 'data'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Data (MB)
                  </button>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartMetric === 'runs' ? (
                    <BarChart data={topToolsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: '1px solid #334155',
                          color: '#f8fafc',
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                        formatter={(val: any, name: any, item: any) => [
                          `${val.toLocaleString()} executions (${item.payload.successRate}% SLA)`,
                          item.payload.fullName
                        ]}
                      />
                      <Bar dataKey="runs" fill="#6366f1" radius={[6, 6, 0, 0]} animationDuration={600}>
                        {topToolsChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.category === 'ai' ? '#3b82f6' : entry.category === 'pdf' ? '#ec4899' : '#6366f1'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : chartMetric === 'successVsFail' ? (
                    <BarChart data={topToolsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: '1px solid #334155',
                          color: '#f8fafc',
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="success" name="Success Jobs" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="failures" name="Failed Jobs" fill="#f43f5e" stackId="a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart data={topToolsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: '1px solid #334155',
                          color: '#f8fafc',
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                        formatter={(val: any) => [`${val} MB transformed`, 'Data Size']}
                      />
                      <Bar dataKey="dataMB" name="Data Volume (MB)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Share Breakdown Donut */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-purple-500" />
                  <span>Category Distribution</span>
                </h3>
                <p className="text-xs text-slate-500">Tool execution share across genres.</p>
              </div>

              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: '12px',
                        padding: '8px 12px'
                      }}
                      formatter={(val: any, name: any, item: any) => [
                        `${val.toLocaleString()} executions (${(
                          (val / (aggregateMetrics.totalRuns || 1)) *
                          100
                        ).toFixed(1)}%)`,
                        item.payload.name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-slate-400">Total</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {aggregateMetrics.totalRuns.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                {categoryChartData.slice(0, 4).map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{cat.name}</span>
                    <span className="ml-auto text-slate-400 font-semibold">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Throughput Area Timeline & Latency SLA Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Timeline Area Chart */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span>Tool Execution Volume Trend</span>
                  </h3>
                  <p className="text-xs text-slate-500">Standard Browser WASM vs AI Neural model volume.</p>
                </div>
                <span className="text-xs font-bold text-slate-400 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {timeRange.toUpperCase()}
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area
                      type="monotone"
                      dataKey="standard"
                      name="Standard Browser Tools"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorStandard)"
                    />
                    <Area
                      type="monotone"
                      dataKey="ai"
                      name="AI Neural Tools"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAi)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Latency & SLA Composed Chart */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Processing Latency (ms) vs Success SLA (%)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Benchmark speed & SLA stability across key modules.</p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={performanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis
                      dataKey="toolName"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      tickLine={false}
                    />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" domain={[80, 100]} tick={{ fontSize: 11, fill: '#10b981' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                      formatter={(val: any, name: any, item: any) => [
                        name === 'Duration (ms)' ? `${val} ms` : `${val}% SLA`,
                        item.payload.fullName
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar yAxisId="left" dataKey="durationMs" name="Duration (ms)" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.85} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="slaRate"
                      name="Success SLA (%)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Granular Tool Execution Telemetry Table */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
                  <span>Granular Tool Telemetry Matrix</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredStats.length} monitored tools in Firestore with live counters.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tools or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary w-48 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter tools by category"
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="image">Image Tools</option>
                  <option value="converter">Converters</option>
                  <option value="pdf">PDF Tools</option>
                  <option value="ai">AI Neural Models</option>
                  <option value="ocr">OCR & Text</option>
                  <option value="utilities">Utilities</option>
                </select>

                {/* Sort Criteria */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    onClick={() => {
                      if (sortBy === 'usage') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      else {
                        setSortBy('usage');
                        setSortOrder('desc');
                      }
                    }}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      sortBy === 'usage'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Usage {sortBy === 'usage' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                  </button>
                  <button
                    onClick={() => {
                      if (sortBy === 'successRate') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      else {
                        setSortBy('successRate');
                        setSortOrder('desc');
                      }
                    }}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      sortBy === 'successRate'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    SLA % {sortBy === 'successRate' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                  </button>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Tool Name & ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Executions</th>
                    <th className="py-3 px-4 text-right">Success / Fail</th>
                    <th className="py-3 px-4 text-right">Success SLA</th>
                    <th className="py-3 px-4 text-right">Data Processed</th>
                    <th className="py-3 px-4 text-right">Avg Latency</th>
                    <th className="py-3 px-4 text-center">Inspect / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredStats.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No tools found matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStats.map((item, index) => {
                      const successRate =
                        item.usageCount > 0 ? ((item.successCount / item.usageCount) * 100).toFixed(1) : '100.0';
                      return (
                        <tr
                          key={item.toolId}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 w-5">#{index + 1}</span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span>{item.toolName}</span>
                                  {item.isAi && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[9px] font-black tracking-wider uppercase">
                                      AI
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{item.toolId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[item.category] || '#64748b'}20`,
                                color: CATEGORY_COLORS[item.category] || '#64748b'
                              }}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                            {item.usageCount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.successCount}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-rose-500 font-semibold">{item.failureCount}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-bold px-2 py-0.5 rounded-lg ${
                                parseFloat(successRate) >= 98
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                  : parseFloat(successRate) >= 95
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {successRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500">
                            {formatFileSize(item.totalBytesProcessed)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500">{item.avgDurationMs} ms</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setInspectedTool(item)}
                                className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                title="Inspect tool details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (navigate) {
                                    navigate(`/${item.toolId}`);
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                title="Open live tool"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER GROWTH & SUBSCRIPTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Plan Distribution Donut */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span>Subscription Tier Share</span>
                </h3>
                <p className="text-xs text-slate-500">Active user accounts by plan tier.</p>
              </div>

              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userPlanDistributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {userPlanDistributionData.map((entry, index) => (
                        <Cell key={`cell-tier-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-slate-400">Total Users</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {aggregateMetrics.totalUsers}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Free Tier</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{aggregateMetrics.freeUsers}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">Pro Tier ($12/mo)</span>
                  </div>
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">{aggregateMetrics.proUsers}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-pink-50/50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    <span className="font-semibold text-pink-700 dark:text-pink-300">Business Tier ($39/mo)</span>
                  </div>
                  <span className="font-bold text-pink-900 dark:text-pink-200">{aggregateMetrics.businessUsers}</span>
                </div>
              </div>
            </div>

            {/* Top Power Users Table */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span>Top Active Users</span>
                  </h3>
                  <p className="text-xs text-slate-500">Ranked by lifetime image processing volume and engagement.</p>
                </div>
                <button
                  onClick={() => handleExportCSV('jobs')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  Export Logs
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3 text-right">Processed Jobs</th>
                      <th className="py-2.5 px-3 text-right">Credits Remaining</th>
                      <th className="py-2.5 px-3 text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {liveUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No users registered in database yet.
                        </td>
                      </tr>
                    ) : (
                      liveUsers
                        .sort((a, b) => (b.usage?.totalProcessedCount || 0) - (a.usage?.totalProcessedCount || 0))
                        .slice(0, 7)
                        .map((u) => (
                          <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {u.displayName || u.email || 'Anonymous User'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{u.uid}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                                  u.plan === 'pro'
                                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                                    : u.plan === 'business'
                                    ? 'bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {u.plan || 'free'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">
                              {(u.usage?.totalProcessedCount || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                              {(u.credits ?? 10).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  u.role === 'admin'
                                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                                    : 'text-slate-500'
                                }`}
                              >
                                {u.role || 'user'}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CREDITS ECONOMY & FINANCIAL MRR */}
      {/* ========================================================================= */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Credit Velocity Timeline Area Chart */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Credit & Token Consumption Velocity</span>
                  </h3>
                  <p className="text-xs text-slate-500">Daily credit burn from AI & heavy transformation jobs.</p>
                </div>
                <span className="text-xs font-bold text-slate-400 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {timeRange.toUpperCase()}
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={creditConsumptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorPurchased" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area
                      type="monotone"
                      dataKey="consumed"
                      name="Credits Consumed"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorConsumed)"
                    />
                    <Area
                      type="monotone"
                      dataKey="purchased"
                      name="Credits Purchased"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPurchased)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Health Summary Card */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span>Monetization Metrics</span>
                </h3>
                <p className="text-xs text-slate-500">Real-time revenue run rate and token velocity.</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">Monthly Recurring Revenue (MRR)</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    ${aggregateMetrics.mrr}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    Based on {aggregateMetrics.proUsers + aggregateMetrics.businessUsers} active paying subscriptions
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">Annual Run Rate (ARR)</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    ${aggregateMetrics.arr}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1">
                    Estimated 12-month ARR baseline
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">Total Credits Consumed</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    {aggregateMetrics.totalCreditsConsumed.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1">
                    In selected timeframe ({timeRange.toUpperCase()})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Ledger Stream Table */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <span>Real-Time Credit Ledger Stream</span>
                </h3>
                <p className="text-xs text-slate-500">Live credit transaction events recorded in Firestore.</p>
              </div>
              <button
                onClick={() => handleExportCSV('ledger')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Export Ledger CSV
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Amount Delta</th>
                    <th className="py-2.5 px-3 text-right">Balance After</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        No transactions recorded in this timeframe.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.slice(0, 8).map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{record.id.substring(0, 10)}..</td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{record.userId.substring(0, 10)}..</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                              record.amount > 0
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {record.transactionType}
                          </span>
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-black ${
                            record.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                          }`}
                        >
                          {record.amount > 0 ? `+${record.amount}` : record.amount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {record.balanceAfter}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 truncate max-w-xs">
                          {record.description}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[10px] text-slate-400">
                          {new Date(record.timestamp || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SLA HEALTH & ERROR LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'reliability' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Error Breakdown Donut */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span>Failure Mode Classification</span>
                </h3>
                <p className="text-xs text-slate-500">Categorized system exception events.</p>
              </div>

              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={errorBreakdownData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="count">
                      {errorBreakdownData.map((entry, index) => (
                        <Cell key={`cell-err-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-slate-400">Total Errors</span>
                  <span className="text-base font-black text-rose-500">
                    {filteredLogs.length || errorBreakdownData.reduce((a, b) => a + b.count, 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                {errorBreakdownData.map((err) => (
                  <div
                    key={err.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: err.color }} />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{err.label}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{err.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Error Logs Stream */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Real-Time Error Stream ({filteredLogs.length} Events)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Captured unhandled exceptions and tool processing timeouts.</p>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300">All Systems Nominal</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      No errors logged in the selected timeframe ({timeRange.toUpperCase()}).
                    </div>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold font-mono text-[10px]">
                            {log.toolId || 'System'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(log.timestamp || Date.now()).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(log.errorMessage || '', log.id)}
                          className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          title="Copy error message"
                        >
                          {copiedLogId === log.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="font-semibold text-rose-900 dark:text-rose-200 break-words">
                        {log.errorMessage}
                      </div>
                      {log.errorStack && (
                        <div className="text-[10px] font-mono text-slate-500 bg-black/10 dark:bg-black/40 p-2 rounded-lg max-h-20 overflow-y-auto whitespace-pre-wrap">
                          {log.errorStack}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FORMATS & COMPRESSION INSIGHTS */}
      {/* ========================================================================= */}
      {activeTab === 'formats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Format Popularity Bar Chart */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  <span>Output File Format Popularity</span>
                </h3>
                <p className="text-xs text-slate-500">Distribution of exported images and document formats.</p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatPopularityData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="format" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                      formatter={(val: any) => [`${val} conversions`, 'Count']}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]}>
                      {formatPopularityData.map((entry, index) => (
                        <Cell key={`cell-fmt-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Compression Efficiency Card */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-500" />
                  <span>Compression & Bandwidth Savings</span>
                </h3>
                <p className="text-xs text-slate-500">Estimated client data saved via WebP & AVIF compression.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">Average Reduction</div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">68.4%</div>
                  <div className="text-[10px] text-slate-400 mt-1">Lossless & Lossy WebP</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">Bandwidth Saved</div>
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    {formatFileSize(aggregateMetrics.totalBytes * 0.68)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Cumulative client savings</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1">
                <div className="font-bold text-indigo-900 dark:text-indigo-200">
                  Native Browser WebAssembly Pipeline
                </div>
                <div className="text-indigo-700 dark:text-indigo-300 text-[11px]">
                  94.2% of standard compression operations run zero-latency on user hardware without consuming server cloud CPU.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOOL INSPECTION MODAL DRAWER */}
      {/* ========================================================================= */}
      {inspectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{inspectedTool.toolName}</span>
                    {inspectedTool.isAi && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase">
                        AI
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{inspectedTool.toolId}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectedTool(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400">Total Executions</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {inspectedTool.usageCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400">Success SLA Rate</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {inspectedTool.usageCount > 0
                    ? ((inspectedTool.successCount / inspectedTool.usageCount) * 100).toFixed(1)
                    : '100'}
                  %
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400">Data Processed</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatFileSize(inspectedTool.totalBytesProcessed)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400">Avg Duration</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {inspectedTool.avgDurationMs} ms
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setInspectedTool(null);
                  if (navigate) navigate(`/${inspectedTool.toolId}`);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Launch & Test Tool</span>
              </button>

              <button
                onClick={() => setInspectedTool(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
