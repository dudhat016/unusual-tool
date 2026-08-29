import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_TOOLS } from '../../config/tools';
import { ToolDefinition } from '../../types';
import { ToolAdminConfig } from '../../types/admin';
import { DataTable, DataTableColumn } from '../ui/DataTable';
import { CustomSelect } from '../ui/Select';
import { AdminToolContentEditor } from './AdminToolContentEditor';
import { Flame, Edit3 } from 'lucide-react';
import { Link } from '../common/Link';

interface AdminToolsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminToolsTab: React.FC<AdminToolsTabProps> = ({ showToast }) => {
  const { navigate, currentPath } = useApp();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingToolId, setEditingToolId] = useState<string | null>(null);

  // Local state for tool overrides
  const [toolConfigs, setToolConfigs] = useState<Record<string, Partial<ToolAdminConfig>>>(() => {
    try {
      const saved = localStorage.getItem('aetherpix_admin_tool_configs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const categories = useMemo(() => Array.from(new Set(ALL_TOOLS.map((t) => t.category))), []);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((t) => categoryFilter === 'all' || t.category === categoryFilter);
  }, [categoryFilter]);

  const handleToggle = (toolId: string, field: keyof ToolAdminConfig) => {
    setToolConfigs((prev) => {
      const current = prev[toolId] || {};
      const next = {
        ...prev,
        [toolId]: {
          ...current,
          [field]: !current[field],
        },
      };
      try {
        localStorage.setItem('aetherpix_admin_tool_configs', JSON.stringify(next));
      } catch {}
      showToast(`Updated ${field} for tool ${toolId}`, 'success');
      return next;
    });
  };

  // Check URL for ?edit=toolId or /admin/tools/edit/toolId
  const urlEditingId = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const editParam = params.get('edit') || params.get('tool');
      if (editParam) return editParam;

      const segments = (currentPath || window.location.pathname).split('/').filter(Boolean);
      // e.g. ['admin', 'tools', 'edit', 'compress-image']
      if (segments.length >= 4 && segments[1] === 'tools' && segments[2] === 'edit') {
        return segments[3];
      }
    } catch {}
    return null;
  }, [currentPath]);

  const activeEditId = editingToolId || urlEditingId;

  const handleStartEdit = (toolId: string) => {
    setEditingToolId(toolId);
    navigate(`/admin/tools?edit=${toolId}`);
  };

  const handleCloseEdit = () => {
    setEditingToolId(null);
    navigate('/admin/tools');
  };

  if (activeEditId) {
    return (
      <AdminToolContentEditor
        toolId={activeEditId}
        onBack={handleCloseEdit}
        showToast={showToast}
      />
    );
  }

  const columns: DataTableColumn<ToolDefinition>[] = [
    {
      id: 'tool',
      header: 'TOOL',
      accessorKey: 'name',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>{row.name}</span>
            {row.isAi && (
              <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] px-1.5 py-0.5 rounded font-black">
                AI
              </span>
            )}
            {row.isPopular && <Flame className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.id}</div>
        </div>
      ),
    },
    {
      id: 'route',
      header: 'ROUTE',
      accessorKey: 'route',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-semibold">
          {row.route}
        </span>
      ),
    },
    {
      id: 'cms',
      header: 'CMS EDIT',
      sortable: false,
      cell: ({ row }) => (
        <Link
          href={`/admin/tools?edit=${row.id}`}
          onClick={(e) => {
            if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
              e.preventDefault();
              handleStartEdit(row.id);
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-[10px] uppercase hover:bg-primary/20 transition-all cursor-pointer"
        >
          <Edit3 className="h-3 w-3" />
          <span>Edit CMS</span>
        </Link>
      ),
    },
    {
      id: 'tier',
      header: 'TIER ACCESS',
      sortable: false,
      cell: ({ row }) => {
        const conf = toolConfigs[row.id] || {};
        const isPremiumOnly = conf.isPremiumOnly ?? Boolean((row as any).isPro || (row as any).isPremium);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(row.id, 'isPremiumOnly');
            }}
            className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase cursor-pointer transition-all ${
              isPremiumOnly
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {isPremiumOnly ? 'Pro Only' : 'Free & Pro'}
          </button>
        );
      },
    },
    {
      id: 'status',
      header: 'STATUS',
      align: 'right',
      sortable: false,
      cell: ({ row }) => {
        const conf = toolConfigs[row.id] || {};
        const isMaintenance = conf.maintenanceMode ?? false;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(row.id, 'maintenanceMode');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-all ${
              isMaintenance
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isMaintenance ? 'Maintenance' : 'Operational'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        data={filteredTools}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search tools by name, ID or route..."
        exportFileName="aetherpix_tools_catalog"
        defaultPageSize={10}
        headerActions={
          <div className="w-56">
            <CustomSelect
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              options={[
                { value: 'all', label: `All Categories (${ALL_TOOLS.length})` },
                ...categories.map((cat) => ({
                  value: cat,
                  label: `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${ALL_TOOLS.filter((t) => t.category === cat).length})`,
                })),
              ]}
            />
          </div>
        }
      />
    </div>
  );
};
