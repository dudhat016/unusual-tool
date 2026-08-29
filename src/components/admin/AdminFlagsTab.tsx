import React, { useState } from 'react';
import { FeatureFlag, FeatureFlagStatus } from '../../types/admin';
import { DEFAULT_FEATURE_FLAGS } from '../../config/featureFlags';
import { DataTable, DataTableColumn } from '../ui/DataTable';
import { Select } from '../ui/Select';

interface AdminFlagsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminFlagsTab: React.FC<AdminFlagsTabProps> = ({ showToast }) => {
  const [flags, setFlags] = useState<FeatureFlag[]>(DEFAULT_FEATURE_FLAGS);

  const handleUpdateStatus = (key: string, nextStatus: FeatureFlagStatus) => {
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, status: nextStatus, updatedAt: Date.now() } : f))
    );
    showToast(`Feature flag ${key} set to ${nextStatus}`, 'success');
  };

  const columns: DataTableColumn<FeatureFlag>[] = [
    {
      id: 'name',
      header: 'FEATURE FLAG',
      accessorKey: 'name',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-extrabold text-slate-900 dark:text-white">{row.name}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.key}</div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'CATEGORY',
      accessorKey: 'category',
      sortable: true,
      cell: ({ row }) => (
        <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
          {row.category}
        </span>
      ),
    },
    {
      id: 'description',
      header: 'DESCRIPTION',
      accessorKey: 'description',
      cell: ({ row }) => <span className="text-slate-500 max-w-sm block text-xs">{row.description}</span>,
    },
    {
      id: 'status',
      header: 'STATUS SELECTOR',
      align: 'right',
      sortable: true,
      cell: ({ row }) => (
        <div className="w-36">
          <Select
            value={row.status}
            onChange={(e) => handleUpdateStatus(row.key, e.target.value as FeatureFlagStatus)}
            options={[
              { value: 'enabled', label: 'Enabled' },
              { value: 'disabled', label: 'Disabled' },
              { value: 'premium_only', label: 'Premium Only' },
              { value: 'coming_soon', label: 'Coming Soon' },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Feature Flag Switchboard</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Dynamically enable, disable, restrict to premium, or show coming soon badges for capabilities.
        </p>
      </div>

      <DataTable
        data={flags}
        columns={columns}
        keyExtractor={(item) => item.key}
        searchPlaceholder="Search feature flags by name, key or category..."
        exportFileName="aetherpix_feature_flags"
        defaultPageSize={10}
      />
    </div>
  );
};
