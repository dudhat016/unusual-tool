import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicToolService } from '../../services/DynamicToolService';
import { ToolDefinition } from '../../types';
import { DataTable, DataTableColumn } from '../ui/DataTable';
import { CustomSelect } from '../ui/Select';
import { AdminToolContentEditor } from './AdminToolContentEditor';
import { AdminToolModal } from './AdminToolModal';
import {
  Flame,
  Edit3,
  Plus,
  Trash2,
  Check,
  X,
  Shield,
  Sparkles,
  Sliders,
  RefreshCw,
  Layers,
  Copy,
  ExternalLink,
  Filter,
  LayoutGrid,
  LayoutList,
  Database,
  Download,
  AlertTriangle,
  Cpu,
  Tag,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Link } from '../common/Link';

interface AdminToolsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminToolsTab: React.FC<AdminToolsTabProps> = ({ showToast }) => {
  const { navigate, currentPath } = useApp();
  const [tools, setTools] = useState<ToolDefinition[]>(() => DynamicToolService.getAllTools());
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ai' | 'pro' | 'free' | 'maintenance' | 'popular'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEditingTool, setModalEditingTool] = useState<ToolDefinition | null>(null);
  const [editingCmsToolId, setEditingCmsToolId] = useState<string | null>(null);
  const [deletingTool, setDeletingTool] = useState<ToolDefinition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Subscribe to dynamic tool updates from Firestore & local cache
  useEffect(() => {
    const unsub = DynamicToolService.subscribe((updated) => {
      setTools([...updated]);
    });
    return unsub;
  }, []);

  // Compute Categories
  const categories = useMemo(() => {
    return Array.from(new Set(tools.map((t) => t.category))).filter(Boolean);
  }, [tools]);

  // Telemetry KPIs
  const stats = useMemo(() => {
    const total = tools.length;
    const aiCount = tools.filter((t) => t.isAi || t.processingType === 'ai').length;
    const proCount = tools.filter((t) => Boolean((t as any).isPremiumOnly || (t as any).isPro)).length;
    const maintenanceCount = tools.filter((t) => Boolean((t as any).maintenanceMode)).length;
    const popularCount = tools.filter((t) => t.isPopular).length;
    const browserCount = tools.filter((t) => t.processingType === 'browser').length;

    return { total, aiCount, proCount, maintenanceCount, popularCount, browserCount };
  }, [tools]);

  // Filtered Tools
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // 1. Category Filter
      if (categoryFilter !== 'all' && tool.category !== categoryFilter) {
        return false;
      }

      // 2. Status Filter
      if (statusFilter === 'ai' && !tool.isAi && tool.processingType !== 'ai') return false;
      if (statusFilter === 'pro' && !Boolean((tool as any).isPremiumOnly || (tool as any).isPro)) return false;
      if (statusFilter === 'free' && Boolean((tool as any).isPremiumOnly || (tool as any).isPro)) return false;
      if (statusFilter === 'maintenance' && !Boolean((tool as any).maintenanceMode)) return false;
      if (statusFilter === 'popular' && !tool.isPopular) return false;

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesId = tool.id.toLowerCase().includes(q);
        const matchesRoute = tool.route.toLowerCase().includes(q);
        const matchesCategory = tool.category.toLowerCase().includes(q);
        const matchesDesc = tool.shortDescription?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesRoute && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [tools, categoryFilter, statusFilter, searchQuery]);

  // Inline boolean toggle handler
  const handleToggle = async (
    tool: ToolDefinition,
    field: 'isPremiumOnly' | 'maintenanceMode' | 'isPopular' | 'isAi'
  ) => {
    const nextVal = !Boolean((tool as any)[field]);
    try {
      const updated = await DynamicToolService.updateToolConfig(tool.id, {
        [field]: nextVal,
      } as any);
      if (updated) {
        showToast(
          `Updated "${field}" to ${nextVal ? 'enabled' : 'disabled'} for ${tool.name}`,
          'success'
        );
      }
    } catch (err) {
      console.error('Failed to toggle tool field', err);
      showToast(`Failed to update ${field} in Firestore`, 'error');
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setModalEditingTool(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (tool: ToolDefinition) => {
    setModalEditingTool(tool);
    setIsModalOpen(true);
  };

  // Duplicate / Clone tool
  const handleDuplicateTool = (tool: ToolDefinition) => {
    const clone: ToolDefinition = {
      ...tool,
      id: `${tool.id}-copy`,
      name: `${tool.name} (Copy)`,
      slug: `${tool.slug}-copy`,
      route: `/${tool.slug}-copy`,
      isNew: true
    };
    setModalEditingTool(clone);
    setIsModalOpen(true);
  };

  // Save / Update tool handler from modal
  const handleSaveTool = async (savedTool: ToolDefinition) => {
    try {
      await DynamicToolService.saveTool(savedTool);
      showToast(
        modalEditingTool && modalEditingTool.id === savedTool.id
          ? `Successfully updated "${savedTool.name}" in Firestore!`
          : `Successfully registered new tool "${savedTool.name}" in Firestore!`,
        'success'
      );
    } catch (err) {
      console.error('Error saving tool to Firestore', err);
      showToast('Failed to save tool to Firestore. Check permissions.', 'error');
      throw err;
    }
  };

  // Execute Deletion
  const handleConfirmDelete = async () => {
    if (!deletingTool) return;
    setIsDeleting(true);
    try {
      await DynamicToolService.deleteTool(deletingTool.id);
      showToast(`Removed tool "${deletingTool.name}" from Firestore catalog`, 'info');
      setDeletingTool(null);
    } catch (err) {
      console.error('Failed to delete tool', err);
      showToast('Error removing tool from Firestore', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Force sync from Firestore
  const handleSyncFirestore = async () => {
    setIsSyncing(true);
    try {
      const refreshed = await DynamicToolService.refreshFromFirestore();
      showToast(`Synced ${refreshed.length} tools live from Firestore`, 'success');
    } catch (err) {
      console.error('Error syncing tools from Firestore', err);
      showToast('Could not refresh from Firestore', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Seed baseline catalog to Firestore
  const handleSeedFirestore = async () => {
    if (
      !window.confirm(
        'Are you sure you want to seed/update all baseline tool definitions into the Firestore "tools" collection?'
      )
    ) {
      return;
    }
    setIsSeeding(true);
    try {
      const count = await DynamicToolService.syncAllBaseToolsToFirestore();
      showToast(`Successfully seeded ${count} tools directly to Firestore!`, 'success');
    } catch (err) {
      console.error('Error seeding baseline tools', err);
      showToast('Failed to batch write tools to Firestore', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Export catalog to JSON
  const handleExportCatalog = () => {
    try {
      const jsonStr = JSON.stringify(tools, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aetherpix_tools_catalog_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Catalog exported to JSON file', 'success');
    } catch (e) {
      showToast('Export failed', 'error');
    }
  };

  // Check URL for CMS editor ?edit=toolId
  const urlEditingId = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const editParam = params.get('edit') || params.get('tool');
      if (editParam) return editParam;

      const segments = (currentPath || window.location.pathname).split('/').filter(Boolean);
      if (segments.length >= 4 && segments[1] === 'tools' && segments[2] === 'edit') {
        return segments[3];
      }
    } catch {}
    return null;
  }, [currentPath]);

  const activeCmsEditId = editingCmsToolId || urlEditingId;

  const handleStartCmsEdit = (toolId: string) => {
    setEditingCmsToolId(toolId);
    navigate(`/admin/tools?edit=${toolId}`);
  };

  const handleCloseCmsEdit = () => {
    setEditingCmsToolId(null);
    navigate('/admin/tools');
  };

  if (activeCmsEditId) {
    return (
      <AdminToolContentEditor
        toolId={activeCmsEditId}
        onBack={handleCloseCmsEdit}
        showToast={showToast}
      />
    );
  }

  // DataTable columns definition
  const columns: DataTableColumn<ToolDefinition>[] = [
    {
      id: 'tool',
      header: 'TOOL',
      accessorKey: 'name',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            {row.icon === 'Sparkles' ? <Sparkles className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
              <span>{row.name}</span>
              {row.isAi && (
                <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 border border-purple-500/20">
                  <Sparkles className="h-2.5 w-2.5" />
                  AI
                </span>
              )}
              {row.isPopular && <Flame className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
              {row.isNew && (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">
                  NEW
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.id}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'CATEGORY',
      accessorKey: 'category',
      sortable: true,
      cell: ({ row }) => (
        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 capitalize border border-slate-200/50 dark:border-slate-700/50">
          {row.category}
        </span>
      ),
    },
    {
      id: 'route',
      header: 'ROUTE',
      accessorKey: 'route',
      sortable: true,
      cell: ({ row }) => (
        <Link
          href={row.route}
          target="_blank"
          className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          <span>{row.route}</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
        </Link>
      ),
    },
    {
      id: 'engine',
      header: 'ENGINE & LIMITS',
      accessorKey: 'processingType',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize flex items-center gap-1">
            <Cpu className="h-3 w-3 text-slate-400" />
            <span>{row.processingType || 'browser'}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {row.creditCost ? `${row.creditCost} credits` : 'Free'} • {row.maxFileSizeMB || 50}MB max
          </div>
        </div>
      ),
    },
    {
      id: 'tier',
      header: 'TIER ACCESS',
      sortable: false,
      cell: ({ row }) => {
        const isPremiumOnly = Boolean((row as any).isPremiumOnly || (row as any).isPro || (row as any).isPremium);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(row, 'isPremiumOnly');
            }}
            className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase cursor-pointer transition-all ${
              isPremiumOnly
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
            title="Click to toggle Pro exclusivity"
          >
            {isPremiumOnly ? 'Pro Only' : 'Free & Pro'}
          </button>
        );
      },
    },
    {
      id: 'status',
      header: 'STATUS',
      sortable: false,
      cell: ({ row }) => {
        const isMaintenance = Boolean((row as any).maintenanceMode);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(row, 'maintenanceMode');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-all ${
              isMaintenance
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Click to toggle maintenance mode"
          >
            {isMaintenance ? 'Maintenance' : 'Operational'}
          </button>
        );
      },
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      align: 'right',
      sortable: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {/* Edit Full Definition Modal */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(row);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
            title="Edit Tool Definition & Parameters"
          >
            <Sliders className="h-3.5 w-3.5" />
          </button>

          {/* Edit CMS / Guides */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartCmsEdit(row.id);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
            title="Edit CMS Content, SEO & FAQs"
          >
            <FileText className="h-3.5 w-3.5" />
          </button>

          {/* Duplicate Tool */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicateTool(row);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clone / Duplicate Tool"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          {/* Delete Tool */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingTool(row);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Remove Tool from Firestore"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Catalog</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Firestore items</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            <span>Browser / WASM</span>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.browserCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zero server cost</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>AI Neural</span>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.aiCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Gemini models</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Pro Gated</span>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.proCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Paid tier only</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
            <Flame className="h-3 w-3" />
            <span>Featured</span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.popularCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Popular tools</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Maintenance</span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.maintenanceCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Temporarily locked</div>
        </div>
      </div>

      {/* 2. Top Action Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Firestore Dynamic Tools Collection</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, edit, or remove tools from <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">/tools</code> collection in Firestore to dynamically configure routes, credit costs, and tier gates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleSyncFirestore}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-750 transition-all cursor-pointer disabled:opacity-50"
            title="Fetch latest tools collection from Firestore"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>

          <button
            onClick={handleSeedFirestore}
            disabled={isSeeding}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-750 transition-all cursor-pointer disabled:opacity-50"
            title="Seed/update base tool definitions into Firestore collection"
          >
            <Database className="h-3.5 w-3.5 text-indigo-500" />
            <span>{isSeeding ? 'Seeding...' : 'Seed to Firestore'}</span>
          </button>

          <button
            onClick={handleExportCatalog}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-750 transition-all cursor-pointer"
            title="Export tools catalog to JSON"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Tool</span>
          </button>
        </div>
      </div>

      {/* 3. Status Filters & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            All Tools ({tools.length})
          </button>

          <button
            onClick={() => setStatusFilter('ai')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'ai'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>AI Neural ({stats.aiCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('pro')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'pro'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Shield className="h-3 w-3" />
            <span>Pro Exclusive ({stats.proCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('free')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'free'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Free Tier ({tools.length - stats.proCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('popular')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'popular'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Flame className="h-3 w-3" />
            <span>Popular ({stats.popularCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('maintenance')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'maintenance'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Maintenance ({stats.maintenanceCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
            title="Table View"
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4. Main Catalog Content: Table vs Grid View */}
      {viewMode === 'table' ? (
        <DataTable
          data={filteredTools}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search tools by name, ID, route, category..."
          exportFileName="aetherpix_firestore_tools_catalog"
          defaultPageSize={12}
          headerActions={
            <div className="w-56">
              <CustomSelect
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                options={[
                  { value: 'all', label: `All Categories (${tools.length})` },
                  ...categories.map((cat) => ({
                    value: cat,
                    label: `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${
                      tools.filter((t) => t.category === cat).length
                    })`,
                  })),
                ]}
              />
            </div>
          }
        />
      ) : (
        /* Card Grid View */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search tools in grid..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="w-full sm:w-56">
              <CustomSelect
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                options={[
                  { value: 'all', label: `All Categories (${tools.length})` },
                  ...categories.map((cat) => ({
                    value: cat,
                    label: `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${
                      tools.filter((t) => t.category === cat).length
                    })`,
                  })),
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const isPremiumOnly = Boolean(
                (tool as any).isPremiumOnly || (tool as any).isPro || (tool as any).isPremium
              );
              const isMaintenance = Boolean((tool as any).maintenanceMode);

              return (
                <div
                  key={tool.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
                >
                  <div>
                    {/* Top Row: Icon & Category & Flags */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                        {tool.icon === 'Sparkles' ? (
                          <Sparkles className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 capitalize">
                          {tool.category}
                        </span>
                        {tool.isAi && (
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-black border border-purple-500/20 flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5" />
                            AI
                          </span>
                        )}
                        {tool.isPopular && <Flame className="h-3.5 w-3.5 text-amber-500" />}
                      </div>
                    </div>

                    {/* Title & Route */}
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tool.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{tool.route}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{tool.shortDescription}</p>
                  </div>

                  {/* Bottom Meta & Action Controls */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <button
                        onClick={() => handleToggle(tool, 'isPremiumOnly')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          isPremiumOnly
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isPremiumOnly ? 'Pro Only' : 'Free & Pro'}
                      </button>

                      <button
                        onClick={() => handleToggle(tool, 'maintenanceMode')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          isMaintenance
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isMaintenance ? 'Maintenance' : 'Operational'}
                      </button>

                      <span className="text-[11px] font-bold text-slate-400">
                        {tool.creditCost ? `${tool.creditCost} cr` : '0 cr'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <Link
                        href={tool.route}
                        target="_blank"
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Live</span>
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(tool)}
                          className="p-1.5 rounded-xl text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Edit Tool Definition"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleStartCmsEdit(tool.id)}
                          className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                          title="Edit CMS Guides & SEO"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingTool(tool)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Delete Tool"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Tool Definition Modal (Add / Edit) */}
      <AdminToolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTool}
        editingTool={modalEditingTool}
        existingTools={tools}
        showToast={showToast}
      />

      {/* 6. Delete Confirmation Dialog */}
      {deletingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200/50 dark:border-rose-800/50">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Remove Tool from Firestore?
                </h3>
                <p className="text-xs text-slate-500">
                  This action will delete the tool document from the catalog.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{deletingTool.name}</div>
              <div className="font-mono text-[11px] text-slate-400 mt-0.5">ID: {deletingTool.id}</div>
              <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                Route: {deletingTool.route}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Users navigating to <code className="font-mono font-bold">{deletingTool.route}</code> will no longer see this tool in navigation catalogs.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTool(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
