import React, { useState, useEffect } from 'react';
import { FeatureFlag, FeatureFlagStatus } from '../../types/admin';
import { DEFAULT_FEATURE_FLAGS } from '../../config/featureFlags';
import { SaaSDataService } from '../../services/SaaSDataService';
import { DataTable, DataTableColumn } from '../ui/DataTable';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { RefreshCw, Sparkles, CheckCircle2, Sliders } from 'lucide-react';

interface AdminFlagsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminFlagsTab: React.FC<AdminFlagsTabProps> = ({ showToast }) => {
  const [flags, setFlags] = useState<FeatureFlag[]>(DEFAULT_FEATURE_FLAGS);
  const [isSyncing, setIsSyncing] = useState(false);

  // Live Firestore subscription
  useEffect(() => {
    const unsub = SaaSDataService.subscribeToFeatureFlags((liveFlags) => {
      setFlags(liveFlags);
    });
    return unsub;
  }, []);

  const handleUpdateStatus = async (key: string, nextStatus: FeatureFlagStatus) => {
    const flagToUpdate = flags.find((f) => f.key === key);
    if (!flagToUpdate) return;

    const updated: FeatureFlag = {
      ...flagToUpdate,
      status: nextStatus,
      updatedAt: Date.now(),
    };

    setFlags((prev) =>
      prev.map((f) => (f.key === key ? updated : f))
    );

    const ok = await SaaSDataService.updateFeatureFlag(updated);
    if (ok) {
      showToast(`Feature flag ${key} updated to ${nextStatus} in Firestore`, 'success');
    } else {
      showToast(`Failed to update feature flag ${key} in Firestore`, 'error');
    }
  };

  const handleSeedDefaults = async () => {
    setIsSyncing(true);
    try {
      await SaaSDataService.seedFeatureFlagsIfEmpty();
      showToast('Feature flags synchronized with Firestore!', 'success');
    } catch {
      showToast('Failed to synchronize feature flags', 'error');
    } finally {
      setIsSyncing(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Feature Flag Switchboard</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              Live Firestore Sync
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dynamically enable, disable, restrict to premium, or show coming soon badges for capabilities in real-time.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSeedDefaults}
          isLoading={isSyncing}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Sync Firestore
        </Button>
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
