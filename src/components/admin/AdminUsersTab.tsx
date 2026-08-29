import React, { useState, useMemo } from 'react';
import { UserProfile, PlanTier } from '../../types/saas';
import { SaaSDataService } from '../../services/SaaSDataService';
import { DataTable, DataTableColumn } from '../ui/DataTable';
import {
  Users,
  Shield,
  CreditCard,
  Ban,
  CheckCircle,
  Edit2,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  UserCheck,
  Mail,
  Sliders,
} from 'lucide-react';

interface AdminUsersTabProps {
  users: UserProfile[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ users, onRefresh, showToast }) => {
  const [selectedUserForCredits, setSelectedUserForCredits] = useState<UserProfile | null>(null);
  const [adjustCreditsAmount, setAdjustCreditsAmount] = useState<number>(50);
  const [adjustCreditsReason, setAdjustCreditsReason] = useState<string>('Support bonus');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [planFilter, setPlanFilter] = useState<string>('all');

  const filteredUsers = useMemo(() => {
    if (planFilter === 'all') return users;
    return users.filter((u) => u.plan === planFilter);
  }, [users, planFilter]);

  const handleAdjustCredits = async () => {
    if (!selectedUserForCredits) return;
    setIsAdjusting(true);
    try {
      const res = await SaaSDataService.adminAdjustUserCredits(
        selectedUserForCredits.uid,
        adjustCreditsAmount,
        adjustCreditsReason
      );
      if (res.success) {
        showToast(
          `Adjusted ${adjustCreditsAmount} credits for ${selectedUserForCredits.email || selectedUserForCredits.uid}`,
          'success'
        );
        setSelectedUserForCredits(null);
        onRefresh();
      } else {
        showToast(res.error || 'Failed to adjust credits', 'error');
      }
    } catch {
      showToast('Error adjusting credits', 'error');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleRoleOrPlanChange = async (userId: string, newPlanOrRole: string) => {
    try {
      if (newPlanOrRole === 'admin' || newPlanOrRole === 'user') {
        await SaaSDataService.adminUpdateUserRole(userId, newPlanOrRole as any);
        showToast(`User role updated to ${newPlanOrRole}`, 'success');
      } else {
        await SaaSDataService.adminUpdateUserPlan(userId, newPlanOrRole as PlanTier);
        showToast(`User plan updated to ${newPlanOrRole}`, 'success');
      }
      onRefresh();
    } catch {
      showToast('Failed to update user', 'error');
    }
  };

  const handleToggleSuspension = async (user: UserProfile) => {
    const nextSuspended = !user.isSuspended;
    try {
      await SaaSDataService.adminToggleUserSuspension(user.uid, nextSuspended, 'Administrative action');
      showToast(`User ${nextSuspended ? 'suspended' : 'unsuspended'}`, 'info');
      onRefresh();
    } catch {
      showToast('Failed to update user status', 'error');
    }
  };

  const formatLastActive = (timestamp?: number) => {
    if (!timestamp) return 'No activity';
    const now = Date.now();
    const diffHours = (now - timestamp) / (1000 * 60 * 60);
    if (diffHours < 24) return 'Yesterday';
    return new Date(timestamp).toLocaleDateString();
  };

  // Define Columns
  const columns: DataTableColumn<UserProfile>[] = useMemo(
    () => [
      {
        id: 'user',
        header: 'USER',
        sortable: true,
        accessorFn: (u) => u.displayName || u.email || u.uid,
        exportFormatter: (u) => `${u.displayName || 'User'} (${u.email || u.uid})`,
        cell: ({ row }) => {
          const initials = (row.displayName || row.email || 'U')
            .slice(0, 2)
            .toUpperCase();
          const avatarColors = [
            'bg-amber-600',
            'bg-indigo-600',
            'bg-purple-600',
            'bg-emerald-600',
            'bg-rose-600',
            'bg-cyan-600',
          ];
          const colorIndex = Math.abs(row.uid.charCodeAt(0) || 0) % avatarColors.length;

          return (
            <div className="flex items-center gap-3">
              {row.photoURL ? (
                <img
                  src={row.photoURL}
                  alt={row.displayName || 'User'}
                  className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-xl ${avatarColors[colorIndex]} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}
                >
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white truncate">
                  {row.displayName || 'Anonymous User'}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                  {row.email || row.uid}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'role',
        header: 'ROLE',
        sortable: true,
        accessorFn: (u) => (u.role === 'admin' ? 'Admin' : u.plan === 'business' ? 'Business' : u.plan === 'pro' ? 'Pro' : 'User'),
        cell: ({ row }) => {
          const currentRoleVal = row.role === 'admin' ? 'admin' : row.plan;
          return (
            <div className="relative inline-block">
              <select
                value={currentRoleVal}
                onChange={(e) => handleRoleOrPlanChange(row.uid, e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-bold text-xs hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
              >
                <option value="admin">Admin</option>
                <option value="business">Business Studio</option>
                <option value="pro">Pro Creator</option>
                <option value="free">Free User</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <span className="text-[10px]">⌄</span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'interests',
        header: 'INTERESTS',
        sortable: false,
        cell: ({ row }) => {
          // Compute or mock tags based on user usage/preferences
          const tags = [];
          if (row.plan === 'business' || row.role === 'admin') tags.push('creative');
          if (row.usage?.totalProcessedCount && row.usage.totalProcessedCount > 5) tags.push('marketing');
          if (row.customSettings?.apiAccessEnabled) tags.push('coding');

          if (tags.length === 0) {
            return <span className="text-slate-400 italic text-[11px]">No interests</span>;
          }

          return (
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        id: 'lastActive',
        header: 'LAST ACTIVE',
        sortable: true,
        accessorFn: (u) => u.updatedAt || u.createdAt,
        cell: ({ row }) => {
          const timestamp = row.updatedAt || row.createdAt;
          const isRecent = timestamp && Date.now() - timestamp < 86400000;
          return (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <Clock
                className={`h-3.5 w-3.5 ${
                  isRecent ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span className={isRecent ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>
                {formatLastActive(timestamp)}
              </span>
            </div>
          );
        },
      },
      {
        id: 'joined',
        header: 'JOINED',
        sortable: true,
        accessorKey: 'createdAt',
        exportFormatter: (u) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'),
        cell: ({ row }) => {
          return (
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '5/15/2026'}
            </span>
          );
        },
      },
      {
        id: 'credits',
        header: 'CREDITS',
        sortable: true,
        accessorKey: 'credits',
        cell: ({ row }) => (
          <span className="font-extrabold text-slate-900 dark:text-white font-mono">
            {row.credits ?? 0}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'STATUS',
        sortable: true,
        accessorFn: (u) => (u.isSuspended ? 'Suspended' : 'Active'),
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              row.isSuspended
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                row.isSuspended ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
            <span>{row.isSuspended ? 'Suspended' : 'Active'}</span>
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        sortable: false,
        hideable: false,
        align: 'right',
        cell: ({ row }) => (
          <div className="inline-flex items-center gap-1.5 justify-end">
            <button
              onClick={() => setSelectedUserForCredits(row)}
              className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 font-bold text-[11px] transition-colors cursor-pointer"
              title="Adjust credit balance"
            >
              Adjust Credits
            </button>

            <button
              onClick={() => handleToggleSuspension(row)}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                row.isSuspended
                  ? 'border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
              title={row.isSuspended ? 'Unsuspend user' : 'Suspend user'}
            >
              {row.isSuspended ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Quick Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Platform Users & Roles</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage platform users, subscription roles, permissions, and balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs"
          >
            <option value="all">All Plans ({users.length})</option>
            <option value="free">Free Tier</option>
            <option value="pro">Pro Creator</option>
            <option value="business">Business Studio</option>
          </select>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
            title="Refresh Users"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Modern Common DataTable */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(u) => u.uid}
        searchPlaceholder="Search by name or email..."
        enableSelection={true}
        selectedIds={selectedUserIds}
        onSelectionChange={(ids) => setSelectedUserIds(ids)}
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        exportFileName="aetherpix_users"
        selectedActions={({ selectedIds, clearSelection }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                showToast(`Selected ${selectedIds.length} users for administrative action`, 'info');
              }}
              className="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 shadow-xs transition-colors"
            >
              Bulk Action ({selectedIds.length})
            </button>
          </div>
        )}
      />

      {/* Adjust Credits Modal */}
      {selectedUserForCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Adjust User Credits</h3>
            <p className="text-xs text-slate-500">
              User:{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedUserForCredits.email || selectedUserForCredits.uid}
              </span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Credit Amount (+ to add, - to debit)
                </label>
                <input
                  type="number"
                  value={adjustCreditsAmount}
                  onChange={(e) => setAdjustCreditsAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={adjustCreditsReason}
                  onChange={(e) => setAdjustCreditsReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedUserForCredits(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustCredits}
                disabled={isAdjusting}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50"
              >
                {isAdjusting ? 'Saving...' : 'Apply Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

