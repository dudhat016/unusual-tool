import React, { useState, useEffect, useRef } from 'react';
import {
  UniversalBatchEngine,
  UniversalBatchJob,
  UniversalBatchStats,
} from '../../engine/batch/UniversalBatchEngine';
import { BeforeAfterComparisonModal } from './BeforeAfterComparisonModal';
import { formatFileSize } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import {
  Play,
  Pause,
  RotateCcw,
  XCircle,
  Download,
  Archive,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Plus,
  Search,
  CheckSquare,
  Square,
  Sliders,
  Eye,
  FileArchive,
  ArrowDownRight,
  Sparkles,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';

interface UniversalBatchQueueProps<TOptions = any> {
  batchEngine: UniversalBatchEngine<TOptions>;
  toolName: string;
  toolSlug: string;
  currentOptions: TOptions;
  onAddMoreFiles?: (files: File[]) => void;
  isAiTool?: boolean;
  creditCostPerImage?: number;
  renderCustomCardFooter?: (job: UniversalBatchJob<TOptions>) => React.ReactNode;
}

export const UniversalBatchQueue: React.FC<UniversalBatchQueueProps> = ({
  batchEngine,
  toolName,
  toolSlug,
  currentOptions,
  onAddMoreFiles,
  isAiTool = false,
  creditCostPerImage = 0,
  renderCustomCardFooter,
}) => {
  const { showToast, addToHistory, userProfile } = useApp();
  const [jobs, setJobs] = useState<UniversalBatchJob[]>([]);
  const [engineState, setEngineState] = useState(batchEngine.getState());
  const [stats, setStats] = useState<UniversalBatchStats>(batchEngine.getStatistics());
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'waiting'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [concurrency, setConcurrency] = useState(batchEngine.getConcurrency());
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Comparison modal state
  const [inspectJob, setInspectJob] = useState<UniversalBatchJob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to batch engine state & queue updates
  useEffect(() => {
    const unsubQueue = batchEngine.subscribeQueue((updatedJobs) => {
      setJobs(updatedJobs);
      setStats(batchEngine.getStatistics());
    });

    const unsubState = batchEngine.subscribeState((st) => {
      setEngineState(st);
      setStats(batchEngine.getStatistics());
    });

    return () => {
      unsubQueue();
      unsubState();
    };
  }, [batchEngine]);

  const handleProcessAll = async () => {
    try {
      showToast(`Starting batch processing for ${jobs.length} images...`, 'info');
      await batchEngine.processAll(currentOptions);
      const latestStats = batchEngine.getStatistics();
      showToast(
        `Batch completed: ${latestStats.completed} succeeded, ${latestStats.failed} failed!`,
        latestStats.failed === 0 ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast(err.message || 'Batch process encountered an error', 'error');
    }
  };

  const handlePauseResume = () => {
    if (engineState.isPaused) {
      batchEngine.resume(currentOptions);
      showToast('Resuming batch execution', 'info');
    } else {
      batchEngine.pause();
      showToast('Batch paused', 'info');
    }
  };

  const handleCancel = () => {
    batchEngine.cancel();
    showToast('Cancelled remaining queue', 'info');
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      await batchEngine.addFiles(newFiles);
      if (onAddMoreFiles) {
        onAddMoreFiles(newFiles);
      }
      showToast(`Added ${newFiles.length} images to the batch queue`, 'success');
      e.target.value = '';
    }
  };

  const handleDownloadZip = async (selectedOnly = false) => {
    try {
      setIsZipping(true);
      setZipProgress(0);

      const cleanToolName = toolSlug.replace(/[^a-zA-Z0-9_-]/g, '_');
      const zipFileName = `${cleanToolName}_batch_${Date.now()}.zip`;

      const { blob, filename } = await batchEngine.generateZip({
        selectedOnly,
        zipFileName,
        onProgress: (pct) => setZipProgress(pct),
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Downloaded archive ${filename} (${formatFileSize(blob.size)})!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create ZIP package', 'error');
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  const handleDownloadSingle = (job: UniversalBatchJob) => {
    const res = job.result;
    if (!res) return;

    if (res.downloadUrl) {
      const link = document.createElement('a');
      link.href = res.downloadUrl;
      link.download = res.name || `processed_${job.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloaded ${res.name || job.name}`, 'success');
    } else if (res.extractedText) {
      const blob = new Blob([res.extractedText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${job.name.split('.')[0]}_extracted.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Downloaded extracted text for ${job.name}`, 'success');
    }
  };

  const handleConcurrencyChange = (val: number) => {
    setConcurrency(val);
    batchEngine.setConcurrency(val);
    showToast(`Batch concurrency set to ${val} parallel workers`, 'info');
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    if (filter === 'completed' && job.status !== 'completed') return false;
    if (filter === 'failed' && job.status !== 'failed') return false;
    if (filter === 'waiting' && job.status !== 'waiting' && job.status !== 'processing') return false;
    if (searchQuery.trim() && !job.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const selectedCount = jobs.filter((j) => j.selected && j.status === 'completed').length;
  const isAllSelected = jobs.length > 0 && jobs.every((j) => j.selected);

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Add More */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main Control Panel Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        {/* Top Header & Dynamic CTA */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Batch Image Queue ({jobs.length} {jobs.length === 1 ? 'image' : 'images'})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              All settings are applied simultaneously across your batch queue
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Add More Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={engineState.isProcessing && !engineState.isPaused}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Add Images</span>
            </button>

            {/* Pause / Resume button if processing */}
            {engineState.isProcessing && (
              <button
                onClick={handlePauseResume}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300 transition-colors"
              >
                {engineState.isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Pause</span>
                  </>
                )}
              </button>
            )}

            {/* Cancel Button */}
            {engineState.isProcessing && (
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            )}

            {/* Main Action Button */}
            <button
              onClick={handleProcessAll}
              disabled={engineState.isProcessing && !engineState.isPaused}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              {engineState.isProcessing && !engineState.isPaused ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing {engineState.activeWorkers} In Parallel...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>
                    Process {jobs.length} {jobs.length === 1 ? 'Image' : 'Images'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Progress Bar */}
        {engineState.isProcessing && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>
                Batch Progress: {stats.completed + stats.failed} / {stats.total} complete
              </span>
              <span>{engineState.progressPercentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${engineState.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Batch Analytics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Completed</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {stats.completed} / {stats.total}
              {stats.failed > 0 && (
                <span className="ml-1.5 text-xs text-rose-500 font-medium">
                  ({stats.failed} failed)
                </span>
              )}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Original Size</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {formatFileSize(stats.totalOriginalBytes)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Processed Size</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatFileSize(stats.totalResultBytes)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Total Saved</p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {stats.reductionPercentage > 0
                ? `-${stats.reductionPercentage}% (${formatFileSize(stats.savedBytes)})`
                : '100%'}
            </p>
          </div>
        </div>

        {/* Filter, Search & Export Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                All ({jobs.length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filter === 'completed'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Completed ({stats.completed})
              </button>
              {stats.failed > 0 && (
                <button
                  onClick={() => setFilter('failed')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    filter === 'failed'
                      ? 'bg-white text-rose-600 shadow-xs dark:bg-slate-900 dark:text-rose-400'
                      : 'text-rose-500 hover:text-rose-700'
                  }`}
                >
                  Failed ({stats.failed})
                </button>
              )}
            </div>

            {/* Select / Deselect All */}
            <button
              onClick={() => batchEngine.selectAll(!isAllSelected)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
              ) : (
                <Square className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
            </button>

            {/* Concurrency Selector */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="shrink-0">Parallel:</span>
              <div className="w-36">
                <Select
                  value={concurrency}
                  onChange={(e) => handleConcurrencyChange(Number(e.target.value))}
                  options={[
                    { value: 2, label: '2 Workers' },
                    { value: 4, label: '4 Workers (Rec.)' },
                    { value: 6, label: '6 Workers' },
                    { value: 8, label: '8 Workers (Fast)' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 sm:w-44 rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Retry Failed */}
            {stats.failed > 0 && (
              <button
                onClick={() => batchEngine.retryFailed(currentOptions)}
                className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Retry ({stats.failed})</span>
              </button>
            )}

            {/* Clear All */}
            <button
              onClick={() => batchEngine.clearQueue()}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 transition-colors"
              title="Clear entire queue"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            {/* Download ZIP button */}
            <button
              onClick={() => handleDownloadZip(false)}
              disabled={stats.completed === 0 || isZipping}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isZipping ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Zipping {zipProgress}%</span>
                </>
              ) : (
                <>
                  <Archive className="h-3.5 w-3.5" />
                  <span>Download ZIP ({stats.completed})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Queue Image List Cards */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Archive className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No images match current filter
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add more images or switch filter tabs to view queued jobs
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const res = job.result as any;
            const resSize = res?.resultSize ?? res?.size;
            const hasResult = Boolean(res && job.status === 'completed');
            const savingsPercent =
              hasResult && job.size > 0 && resSize !== undefined
                ? Math.round(((job.size - resSize) / job.size) * 100)
                : 0;

            return (
              <div
                key={job.id}
                className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white p-4 transition-all dark:bg-slate-900 ${
                  job.status === 'processing'
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md dark:border-blue-500'
                    : job.status === 'completed'
                    ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    : job.status === 'failed'
                    ? 'border-rose-300 bg-rose-50/20 dark:border-rose-900 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 opacity-90'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Select Checkbox */}
                  <Checkbox
                    checked={job.selected}
                    onChange={() => batchEngine.toggleSelect(job.id)}
                  />

                  {/* Thumbnail */}
                  <div
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 cursor-pointer group"
                    onClick={() => {
                      if (hasResult) {
                        setInspectJob(job);
                      }
                    }}
                  >
                    {job.thumbnailUrl ? (
                      <img
                        src={job.thumbnailUrl}
                        alt={job.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-[10px] font-bold text-slate-400">{job.format}</div>
                    )}
                    {hasResult && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Text Information */}
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-xs md:max-w-md">
                      {job.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold uppercase text-slate-700 dark:text-slate-300">
                        {job.format}
                      </span>
                      <span>•</span>
                      <span>
                        {job.width && job.height ? `${job.width}×${job.height}px` : 'Image'}
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(job.size)}</span>
                      {job.executionTimeMs !== undefined && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-400">
                            {job.executionTimeMs}ms
                          </span>
                        </>
                      )}
                    </div>

                    {job.error && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                        Error: {job.error}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Status Pill, Metrics & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Status Indicator */}
                  <div>
                    {job.status === 'waiting' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>Waiting</span>
                      </span>
                    )}

                    {job.status === 'processing' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                        <span>Processing...</span>
                      </span>
                    )}

                    {job.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>{resSize ? formatFileSize(resSize) : 'Done'}</span>
                        </span>

                        {savingsPercent > 0 && (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            -{savingsPercent}%
                          </span>
                        )}
                      </div>
                    )}

                    {job.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        <AlertCircle className="h-3 w-3 text-rose-600" />
                        <span>Failed</span>
                      </span>
                    )}

                    {job.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <span>Cancelled</span>
                      </span>
                    )}
                  </div>

                  {/* Actions Group */}
                  <div className="flex items-center gap-1">
                    {/* Before/After Compare Modal Trigger */}
                    {hasResult && (
                      <button
                        onClick={() => setInspectJob(job)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Compare Before & After"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}

                    {/* Single Download */}
                    {hasResult && (
                      <button
                        onClick={() => handleDownloadSingle(job)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Download Result"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}

                    {/* Retry Single */}
                    {(job.status === 'failed' || job.status === 'cancelled') && (
                      <button
                        onClick={() => batchEngine.retryJob(job.id, currentOptions)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Retry processing"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}

                    {/* Remove Item */}
                    <button
                      onClick={() => batchEngine.removeJob(job.id)}
                      disabled={job.status === 'processing'}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                      title="Remove from queue"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {renderCustomCardFooter && renderCustomCardFooter(job)}
              </div>
            );
          })
        )}
      </div>

      {/* Before / After Inspection Modal */}
      {inspectJob && inspectJob.result && (
        <BeforeAfterComparisonModal
          isOpen={Boolean(inspectJob)}
          onClose={() => setInspectJob(null)}
          originalUrl={inspectJob.thumbnailUrl || URL.createObjectURL(inspectJob.file)}
          resultUrl={(inspectJob.result as any).dataUrl || (inspectJob.result as any).downloadUrl}
          originalName={inspectJob.name}
          resultName={(inspectJob.result as any).name}
          originalSize={inspectJob.size}
          resultSize={(inspectJob.result as any).resultSize ?? (inspectJob.result as any).size ?? 0}
          originalDimensions={{ width: inspectJob.width, height: inspectJob.height }}
          resultDimensions={{
            width: (inspectJob.result as any).resultWidth ?? inspectJob.width,
            height: (inspectJob.result as any).resultHeight ?? inspectJob.height,
          }}
          downloadUrl={(inspectJob.result as any).downloadUrl}
        />
      )}
    </div>
  );
};
