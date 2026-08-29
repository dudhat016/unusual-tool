import React, { useState, useMemo, useEffect } from 'react';
import { UploadedFileItem, ProcessedResult, WatermarkOptions, ToolDefinition } from '../../types';
import { addWatermark } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { ImagePreview } from '../common/ImagePreview';
import { UniversalBatchEngine } from '../../engine/batch/UniversalBatchEngine';
import { UniversalBatchQueue } from '../common/UniversalBatchQueue';
import { Slider } from '../ui/Slider';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  Stamp,
  RefreshCw,
  Layers,
  Eye,
  Type,
  Image as ImageIcon,
  SlidersHorizontal,
} from 'lucide-react';

interface WatermarkToolViewProps {
  tool?: ToolDefinition;
}

export const WatermarkToolView: React.FC<WatermarkToolViewProps> = ({ tool }) => {
  const { showToast, addToHistory } = useApp();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');

  const [options, setOptions] = useState<WatermarkOptions>({
    type: 'text',
    text: '© Confidential',
    position: 'bottom-right',
    opacity: 0.6,
    fontSize: 32,
    textColor: '#FFFFFF',
    rotation: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const currentFile = files[activeFileIndex] || files[0];

  // Initialize Universal Batch Engine
  const batchEngine = useMemo(() => {
    return new UniversalBatchEngine<WatermarkOptions>({
      concurrency: 4,
      processor: async (file, currentOpt) => {
        return await addWatermark(file, currentOpt);
      },
      defaultOptions: options,
    });
  }, []);

  // Sync batch options whenever controls change
  useEffect(() => {
    batchEngine.setDefaultOptions(options);
  }, [batchEngine, options]);

  // Auto switch mode when files count changes
  useEffect(() => {
    if (files.length > 1) {
      setViewMode('batch');
    } else {
      setViewMode('single');
    }
  }, [files.length]);

  const handleFilesSelected = async (newItems: UploadedFileItem[]) => {
    batchEngine.clear();
    const rawFiles = newItems.map((item) => item.file);
    await batchEngine.addFiles(rawFiles);
    setFiles(newItems);
    setActiveFileIndex(0);
    setResult(null);
  };

  const handleSingleApply = async () => {
    if (!currentFile) return;
    setIsProcessing(true);
    try {
      const res = await addWatermark(currentFile.file, options);
      setResult(res);
      addToHistory({
        toolId: 'watermark-image',
        toolName: 'Watermark Image',
        thumbnail: res.dataUrl,
        originalName: currentFile.name,
        originalSize: currentFile.size,
        resultSize: res.size,
        downloadName: res.name,
        blobDataUrl: res.dataUrl,
      });
      showToast('Watermark stamped successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Watermarking failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {files.length === 0 ? (
        <UploadZone
          onFilesSelected={handleFilesSelected}
          multiple={true}
          maxFileSizeMB={50}
          title="Upload image or drop multiple images to watermark"
          subtitle="Stamp custom brand logos, copyright marks, or tiling watermarks across 1 or 100+ images in batch"
        />
      ) : (
        <div className="space-y-6">
          {/* Top Bar: View Mode Switcher (if multiple files) & Reset */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Stamp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Watermark Protection ({files.length} {files.length === 1 ? 'Image' : 'Images'})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewMode === 'batch'
                    ? 'Stamps your watermark branding simultaneously across all queued photos'
                    : 'Interactive preview and single-photo stamping'}
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
                  setResult(null);
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
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Watermark Configuration</h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {files.length > 1 ? 'Applied to all' : 'Active'}
                  </span>
                </div>

                <Input
                  label="Watermark Text"
                  type="text"
                  value={options.text || ''}
                  onChange={(e) => setOptions((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder="© 2025 Brand Name"
                />

                {/* Position Matrix */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Placement Position
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'top-left', label: 'Top Left' },
                      { id: 'center', label: 'Center' },
                      { id: 'top-right', label: 'Top Right' },
                      { id: 'bottom-left', label: 'Bottom Left' },
                      { id: 'tile', label: 'Tile Grid' },
                      { id: 'bottom-right', label: 'Bottom Right' },
                    ].map((pos) => (
                      <Button
                        key={pos.id}
                        variant={options.position === pos.id ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setOptions((prev) => ({
                            ...prev,
                            position: pos.id as any,
                          }))
                        }
                      >
                        {pos.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Opacity Slider */}
                <Slider
                  label="Opacity"
                  min={10}
                  max={100}
                  step={5}
                  value={Math.round((options.opacity || 0.6) * 100)}
                  unit="%"
                  onChange={(v) => setOptions((prev) => ({ ...prev, opacity: v / 100 }))}
                />

                {/* Font Size Slider */}
                <Slider
                  label="Font Size"
                  min={12}
                  max={90}
                  step={1}
                  value={options.fontSize || 32}
                  unit="px"
                  onChange={(v) => setOptions((prev) => ({ ...prev, fontSize: v }))}
                />

                {/* Single Image Action Button */}
                {viewMode === 'single' && (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isProcessing}
                    leftIcon={Stamp}
                    disabled={!currentFile}
                    onClick={handleSingleApply}
                  >
                    Stamp Watermark
                  </Button>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {viewMode === 'batch' ? (
                <UniversalBatchQueue
                  batchEngine={batchEngine}
                  toolName="Watermark Image"
                  toolSlug="watermark-image"
                  currentOptions={options}
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
              ) : result ? (
                <ImagePreview originalFile={currentFile} result={result} />
              ) : currentFile ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-center dark:border-slate-800 min-h-[420px] flex flex-col items-center justify-center">
                  <img
                    src={currentFile.previewUrl}
                    alt={currentFile.name}
                    className="max-h-[340px] max-w-full rounded-xl object-contain shadow-lg"
                  />
                  <p className="mt-4 text-xs font-mono text-slate-400">
                    Ready to stamp "{options.text}"
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
