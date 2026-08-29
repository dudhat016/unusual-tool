import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatFileSize } from '../engine/imageEngine';
import { DataTable, DataTableColumn } from '../components/ui/DataTable';
import {
  Clock,
  Trash2,
  Download,
  HardDrive,
  ShieldCheck,
  Cpu,
  Sparkles,
  Layers,
  ArrowRight,
  LayoutGrid,
  List,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { history = [], clearHistory, removeFromHistory, showToast, navigate } = useApp();
  const safeHistory = history || [];
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);

  const totalSavedBytes = safeHistory.reduce((acc, item) => {
    if (item.originalSize > item.resultSize) {
      return acc + (item.originalSize - item.resultSize);
    }
    return acc;
  }, 0);

  const historyColumns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        id: 'preview',
        header: 'IMAGE',
        sortable: false,
        width: 80,
        cell: ({ row }) => (
          <img
            src={row.thumbnail}
            alt={row.originalName}
            className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800"
          />
        ),
      },
      {
        id: 'file',
        header: 'FILE & TOOL',
        sortable: true,
        accessorKey: 'originalName',
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{row.originalName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 text-[10px] font-bold">
                {row.toolName}
              </span>
              {row.processorType === 'ai' ? (
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">AI</span>
              ) : (
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">WASM</span>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'sizes',
        header: 'ORIGINAL → RESULT',
        sortable: true,
        accessorFn: (row) => row.resultSize,
        exportFormatter: (row) => `${formatFileSize(row.originalSize)} -> ${formatFileSize(row.resultSize)}`,
        cell: ({ row }) => (
          <div className="font-mono text-xs">
            <span className="text-slate-400">{formatFileSize(row.originalSize)}</span>
            <span className="text-slate-400 mx-1">→</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatFileSize(row.resultSize)}
            </span>
          </div>
        ),
      },
      {
        id: 'savings',
        header: 'SAVINGS',
        sortable: true,
        accessorFn: (row) => {
          if (!row.originalSize || row.originalSize <= row.resultSize) return 0;
          return Math.round(((row.originalSize - row.resultSize) / row.originalSize) * 100);
        },
        cell: ({ row }) => {
          const pct =
            row.originalSize && row.originalSize > row.resultSize
              ? Math.round(((row.originalSize - row.resultSize) / row.originalSize) * 100)
              : 0;
          return (
            <span
              className={`font-mono text-xs font-black ${
                pct > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}
            >
              {pct > 0 ? `-${pct}%` : '0%'}
            </span>
          );
        },
      },
      {
        id: 'timestamp',
        header: 'DATE',
        sortable: true,
        accessorKey: 'timestamp',
        exportFormatter: (row) => new Date(row.timestamp).toLocaleString(),
        cell: ({ row }) => (
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
            {new Date(row.timestamp).toLocaleDateString()}
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
          <div className="flex items-center justify-end gap-1.5">
            <a
              href={row.blobDataUrl}
              download={row.downloadName}
              className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition-colors cursor-pointer"
              title="Download file"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => removeFromHistory(row.id)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Remove item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [removeFromHistory]
  );

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Processing History
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Locally stored records from your recent client-side editing session.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {safeHistory.length > 0 && (
            <>
              <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Cards View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  clearHistory();
                  showToast('History cleared!', 'info');
                }}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear History</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary stats */}
      {safeHistory.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Images Processed</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {safeHistory.length} photos
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Bandwidth Saved</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatFileSize(totalSavedBytes)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Privacy & Security</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Client-Side Private</span>
            </p>
          </div>
        </div>
      )}

      {/* History Items Display */}
      {safeHistory.length > 0 ? (
        viewMode === 'table' ? (
          <DataTable
            data={safeHistory}
            columns={historyColumns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search processed files..."
            enableSelection={true}
            selectedIds={selectedHistoryIds}
            onSelectionChange={(ids) => setSelectedHistoryIds(ids)}
            defaultPageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
            exportFileName="processed_images_history"
            selectedActions={({ selectedIds, clearSelection }) => (
              <button
                onClick={() => {
                  selectedIds.forEach((id) => removeFromHistory(id));
                  clearSelection();
                  showToast(`Removed ${selectedIds.length} items from history`, 'info');
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 cursor-pointer"
              >
                Delete Selected ({selectedIds.length})
              </button>
            )}
          />
        ) : (
          <div className="space-y-3">
            {safeHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.thumbnail}
                    alt={item.originalName}
                    className="h-16 w-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-800"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {item.toolName}
                      </span>
                      {item.processorType === 'ai' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
                          <Sparkles className="w-3 h-3" /> AI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                          <Cpu className="w-3 h-3" /> Browser
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.processingTime ? (
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({item.processingTime}ms)
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                      {item.originalName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>{formatFileSize(item.originalSize)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatFileSize(item.resultSize)}
                      </span>
                      {item.resultWidth && item.resultHeight && (
                        <span className="text-slate-400 ml-1">
                          • {item.resultWidth}×{item.resultHeight}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={item.blobDataUrl}
                    download={item.downloadName}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => removeFromHistory(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/40 space-y-4">
          <Clock className="h-10 w-10 text-slate-300 mx-auto dark:text-slate-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No image history yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Photos you process using any image tool will appear here for fast re-downloading.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors cursor-pointer"
          >
            Explore Image Tools
          </button>
        </div>
      )}
    </div>
  );
};

