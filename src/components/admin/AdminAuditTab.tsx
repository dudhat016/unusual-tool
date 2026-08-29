import React, { useState, useEffect, useMemo } from 'react';
import { AdminAuditLog } from '../../types/admin';
import { CreditLedgerRecord, SystemErrorLog } from '../../types/saas';
import { SaaSDataService } from '../../services/SaaSDataService';
import { DataTable, DataTableColumn } from '../ui/DataTable';
import { ShieldCheck, History, AlertOctagon, RefreshCw, Clock } from 'lucide-react';

interface AdminAuditTabProps {
  ledger: CreditLedgerRecord[];
  errorLogs: SystemErrorLog[];
}

export const AdminAuditTab: React.FC<AdminAuditTabProps> = ({ ledger, errorLogs }) => {
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'ledger' | 'errors'>('audit');
  const [loading, setLoading] = useState(false);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const logs = await SaaSDataService.getAllAuditLogs(50);
      setAuditLogs(logs);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  // Columns for Admin Audit Logs
  const auditColumns: DataTableColumn<AdminAuditLog>[] = useMemo(
    () => [
      {
        id: 'timestamp',
        header: 'TIMESTAMP',
        sortable: true,
        accessorKey: 'timestamp',
        exportFormatter: (l) => new Date(l.timestamp).toLocaleString(),
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {new Date(row.timestamp).toLocaleString()}
          </span>
        ),
      },
      {
        id: 'adminEmail',
        header: 'ADMIN',
        sortable: true,
        accessorKey: 'adminEmail',
        cell: ({ row }) => (
          <span className="font-bold text-slate-800 dark:text-slate-200">{row.adminEmail}</span>
        ),
      },
      {
        id: 'action',
        header: 'ACTION',
        sortable: true,
        accessorKey: 'action',
        cell: ({ row }) => (
          <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md">
            {row.action}
          </span>
        ),
      },
      {
        id: 'targetId',
        header: 'TARGET',
        sortable: true,
        accessorKey: 'targetId',
        cell: ({ row }) => (
          <span className="text-slate-500 font-mono text-[11px]">{row.targetId}</span>
        ),
      },
      {
        id: 'newValue',
        header: 'NEW VALUE',
        sortable: false,
        accessorFn: (l) => JSON.stringify(l.newValue),
        cell: ({ row }) => (
          <span className="font-mono text-[10px] text-slate-400 max-w-xs truncate block">
            {JSON.stringify(row.newValue)}
          </span>
        ),
      },
    ],
    []
  );

  // Columns for Credits Ledger
  const ledgerColumns: DataTableColumn<CreditLedgerRecord>[] = useMemo(
    () => [
      {
        id: 'timestamp',
        header: 'TIMESTAMP',
        sortable: true,
        accessorKey: 'timestamp',
        exportFormatter: (item) => new Date(item.timestamp).toLocaleString(),
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {new Date(row.timestamp).toLocaleString()}
          </span>
        ),
      },
      {
        id: 'userId',
        header: 'USER ID',
        sortable: true,
        accessorKey: 'userId',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-slate-500 truncate max-w-[140px] block">
            {row.userId}
          </span>
        ),
      },
      {
        id: 'transactionType',
        header: 'TYPE',
        sortable: true,
        accessorKey: 'transactionType',
        cell: ({ row }) => (
          <span className="font-bold capitalize text-slate-700 dark:text-slate-300">
            {row.transactionType}
          </span>
        ),
      },
      {
        id: 'amount',
        header: 'AMOUNT',
        sortable: true,
        accessorKey: 'amount',
        cell: ({ row }) => (
          <span
            className={`font-black font-mono ${
              row.amount > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {row.amount > 0 ? `+${row.amount}` : row.amount}
          </span>
        ),
      },
      {
        id: 'balanceAfter',
        header: 'BALANCE AFTER',
        sortable: true,
        accessorKey: 'balanceAfter',
        cell: ({ row }) => (
          <span className="font-bold text-slate-900 dark:text-white font-mono">
            {row.balanceAfter}
          </span>
        ),
      },
      {
        id: 'description',
        header: 'DESCRIPTION',
        sortable: true,
        accessorKey: 'description',
        cell: ({ row }) => <span className="text-slate-500 text-xs">{row.description}</span>,
      },
    ],
    []
  );

  // Columns for System Errors
  const errorColumns: DataTableColumn<SystemErrorLog>[] = useMemo(
    () => [
      {
        id: 'timestamp',
        header: 'TIMESTAMP',
        sortable: true,
        accessorKey: 'timestamp',
        exportFormatter: (err) => new Date(err.timestamp).toLocaleString(),
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {new Date(row.timestamp).toLocaleString()}
          </span>
        ),
      },
      {
        id: 'toolId',
        header: 'TOOL',
        sortable: true,
        accessorFn: (err) => err.toolId || 'Client Core',
        cell: ({ row }) => (
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {row.toolId || 'Client Core'}
          </span>
        ),
      },
      {
        id: 'errorMessage',
        header: 'ERROR MESSAGE',
        sortable: true,
        accessorKey: 'errorMessage',
        cell: ({ row }) => (
          <span className="text-rose-600 dark:text-rose-400 font-mono text-[11px]">
            {row.errorMessage}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Audit Trail & System Logs</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable ledger of administrative actions, credit transactions, and client errors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeSubTab === 'audit'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Admin Audit ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeSubTab === 'ledger'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Credits Ledger ({ledger.length})
            </button>
            <button
              onClick={() => setActiveSubTab('errors')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeSubTab === 'errors'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              System Errors ({errorLogs.length})
            </button>
          </div>

          <button
            onClick={loadAuditLogs}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 cursor-pointer shadow-xs"
            title="Refresh Audit Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {activeSubTab === 'audit' && (
        <DataTable
          data={auditLogs}
          columns={auditColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search audit logs..."
          exportFileName="admin_audit_logs"
          emptyMessage="No administrative audit entries logged yet."
          defaultPageSize={10}
        />
      )}

      {activeSubTab === 'ledger' && (
        <DataTable
          data={ledger}
          columns={ledgerColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search credit transactions..."
          exportFileName="credit_ledger_records"
          emptyMessage="No credit transactions recorded."
          defaultPageSize={10}
        />
      )}

      {activeSubTab === 'errors' && (
        <DataTable
          data={errorLogs}
          columns={errorColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search error logs..."
          exportFileName="system_error_logs"
          emptyMessage="Zero client error logs recorded."
          defaultPageSize={10}
        />
      )}
    </div>
  );
};
