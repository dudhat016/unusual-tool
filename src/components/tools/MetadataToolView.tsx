import React, { useState, useEffect, useMemo } from 'react';
import { UploadedFileItem, ProcessedResult, ToolDefinition } from '../../types';
import { readImageMetadata, stripMetadata } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { ImagePreview } from '../common/ImagePreview';
import { UniversalBatchEngine } from '../../engine/batch/UniversalBatchEngine';
import { UniversalBatchQueue } from '../common/UniversalBatchQueue';
import { Button } from '../ui/Button';
import {
  Info,
  ShieldAlert,
  ShieldCheck,
  Download,
  Trash2,
  Check,
  Layers,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface MetadataToolViewProps {
  tool?: ToolDefinition;
}

export const MetadataToolView: React.FC<MetadataToolViewProps> = ({ tool }) => {
  const { showToast, addToHistory } = useApp();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');

  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [strippedResult, setStrippedResult] = useState<ProcessedResult | null>(null);
  const [isStripping, setIsStripping] = useState(false);

  const currentFile = files[activeFileIndex] || files[0];

  // Initialize Universal Batch Engine
  const batchEngine = useMemo(() => {
    return new UniversalBatchEngine<{}>({
      concurrency: 4,
      processor: async (file) => {
        return await stripMetadata(file);
      },
      defaultOptions: {},
    });
  }, []);

  // Auto switch mode when files count changes
  useEffect(() => {
    if (files.length > 1) {
      setViewMode('batch');
    } else {
      setViewMode('single');
    }
  }, [files.length]);

  useEffect(() => {
    if (currentFile) {
      readImageMetadata(currentFile.file).then((meta) => {
        setMetadata(meta);
        setStrippedResult(null);
      });
    }
  }, [currentFile?.id]);

  const handleFilesSelected = async (newItems: UploadedFileItem[]) => {
    batchEngine.clear();
    const rawFiles = newItems.map((item) => item.file);
    await batchEngine.addFiles(rawFiles);
    setFiles(newItems);
    setActiveFileIndex(0);
    setStrippedResult(null);
  };

  const handleSingleStrip = async () => {
    if (!currentFile) return;
    setIsStripping(true);
    try {
      const res = await stripMetadata(currentFile.file);
      setStrippedResult(res);
      addToHistory({
        toolId: 'metadata-tool',
        toolName: 'Metadata Viewer & Stripper',
        thumbnail: res.dataUrl,
        originalName: currentFile.name,
        originalSize: currentFile.size,
        resultSize: res.size,
        downloadName: res.name,
        blobDataUrl: res.dataUrl,
      });
      showToast('All EXIF and GPS metadata permanently stripped!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to strip metadata', 'error');
    } finally {
      setIsStripping(false);
    }
  };

  return (
    <div className="space-y-8">
      {files.length === 0 ? (
        <UploadZone
          onFilesSelected={handleFilesSelected}
          multiple={true}
          maxFileSizeMB={50}
          title="Upload image or drop multiple photos to strip metadata"
          subtitle="Permanently erase GPS coordinates, camera specs, dates, and sensitive EXIF tags in batch"
        />
      ) : (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Metadata Viewer & Stripper ({files.length} {files.length === 1 ? 'Image' : 'Images'})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewMode === 'batch'
                    ? 'Bulk privacy scrubber: permanently removes EXIF/GPS from all queued images'
                    : 'Inspect embedded EXIF data and strip single files'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {files.length > 1 && (
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  <button
                    onClick={() => setViewMode('batch')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'batch'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Batch Queue ({files.length})</span>
                  </button>
                  <button
                    onClick={() => setViewMode('single')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'single'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Single Inspector</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  batchEngine.clear();
                  setFiles([]);
                  setStrippedResult(null);
                  setMetadata(null);
                }}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Privacy & EXIF Info</h3>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {files.length > 1 ? 'Sanitizes all' : 'Active'}
                  </span>
                </div>

                {/* Privacy Warning */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <div className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                    <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Photos from smartphones and DSLRs embed GPS coordinates, serial numbers, timestamps, and camera details. Stripping renders the photo completely clean.
                    </span>
                  </div>
                </div>

                {/* Metadata Table for Current Inspection */}
                {metadata && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs">
                    {Object.entries(metadata).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between p-2.5">
                        <span className="capitalize font-medium text-slate-500 dark:text-slate-400">
                          {k.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Single Image Action Button */}
                {viewMode === 'single' && (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isStripping}
                    leftIcon={Trash2}
                    disabled={!currentFile}
                    onClick={handleSingleStrip}
                  >
                    Strip All EXIF Data
                  </Button>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {viewMode === 'batch' ? (
                <UniversalBatchQueue
                  batchEngine={batchEngine}
                  toolName="EXIF & Metadata Stripper"
                  toolSlug="metadata-tool"
                  currentOptions={{}}
                  onAddMoreFiles={async (moreFiles) => {
                    const newItems: UploadedFileItem[] = moreFiles.map((f) => ({
                      id: `${f.name}-${Date.now()}-${Math.random()}`,
                      name: f.name,
                      size: f.size,
                      type: f.type,
                      file: f,
                      previewUrl: URL.createObjectURL(f),
                      width: 1000,
                      height: 1000,
                      aspectRatio: 1,
                    }));
                    setFiles((prev) => [...prev, ...newItems]);
                  }}
                />
              ) : strippedResult ? (
                <ImagePreview originalFile={currentFile} result={strippedResult} />
              ) : currentFile ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-center dark:border-slate-800 min-h-[420px] flex flex-col items-center justify-center">
                  <img
                    src={currentFile.previewUrl}
                    alt={currentFile.name}
                    className="max-h-[340px] max-w-full rounded-xl object-contain shadow-lg"
                  />
                  <p className="mt-4 text-xs font-mono text-slate-400">
                    Ready to scrub EXIF metadata from {currentFile.name}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
