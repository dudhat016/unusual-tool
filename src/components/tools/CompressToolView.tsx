import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UploadedFileItem, UniversalProcessResult, CompressOptions, ToolDefinition } from '../../types';
import { Checkbox } from '../ui/Checkbox';
import { compressImage, formatFileSize } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { ImagePreview } from '../common/ImagePreview';
import { ExactTargetSizesGrid } from '../common/ExactTargetSizesGrid';
import { TargetSizeInput } from '../common/TargetSizeInput';
import { Button } from '../ui/Button';
import { UniversalBatchEngine } from '../../engine/batch/UniversalBatchEngine';
import { UniversalBatchQueue } from '../common/UniversalBatchQueue';
import {
  Minimize2,
  RefreshCw,
  ShieldCheck,
  Check,
  Sparkles,
  AlertTriangle,
  Sliders,
  Type,
  ImageIcon,
  Zap,
  CheckCircle2,
  ArrowRight,
  Info,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';

interface CompressToolViewProps {
  tool?: ToolDefinition;
}

export const CompressToolView: React.FC<CompressToolViewProps> = ({ tool }) => {
  const { showToast, addToHistory, currentPath } = useApp();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [activeViewTab, setActiveViewTab] = useState<'single' | 'batch'>('single');

  // Parse target size and format from tool or URL route
  const parsedTargetConfig = useMemo(() => {
    const slug = tool?.slug || currentPath.replace(/^\/+|\/+$/g, '');
    let targetKb = 50;
    let format: 'auto' | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif' = 'auto';
    let isExactRoute = false;

    // Check pattern: compress-jpeg-to-10kb, compress-image-to-5kb, resize-image-to-50kb, etc.
    const match = slug.match(
      /^(?:compress|resize)-(?:image|jpeg|jpg|png|webp|avif)?-?(?:between-)?(\d+)?(?:kb|mb)?(?:-to-)?(\d+)(kb|mb)/i
    );
    if (match) {
      isExactRoute = true;
      const num = parseInt(match[2], 10);
      const unit = match[3].toLowerCase();
      targetKb = unit === 'mb' ? num * 1000 : num;
    } else if (slug.includes('between-20kb-to-50kb')) {
      isExactRoute = true;
      targetKb = 35;
    }

    if (slug.includes('jpeg') || slug.includes('jpg')) {
      format = 'image/jpeg';
    } else if (slug.includes('webp')) {
      format = 'image/webp';
    } else if (slug.includes('avif')) {
      format = 'image/avif';
    } else if (slug.includes('png')) {
      format = 'image/png';
    }

    return { targetKb, format, isExactRoute, slug };
  }, [tool?.slug, currentPath]);

  // Target size in KB state
  const [targetKb, setTargetKb] = useState<number>(parsedTargetConfig.targetKb);

  const [options, setOptions] = useState<CompressOptions>({
    mode: 'target-size',
    targetSizeKb: parsedTargetConfig.targetKb,
    quality: 0.85,
    outputFormat: parsedTargetConfig.format,
    qualityMode: 'best-quality',
    preserveDimensions: false,
    optimizeForText: true,
    optimizeForGraphics: true,
    allowWebpBetter: true,
    allowAvifBetter: true,
    stripMetadata: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [result, setResult] = useState<UniversalProcessResult | null>(null);

  // Batch Engine instance with parallel worker pool
  const batchEngine = useMemo(() => {
    return new UniversalBatchEngine<CompressOptions>({
      concurrency: 4,
      defaultOptions: options,
      processor: async (file, opts) => {
        return await compressImage(file, opts);
      },
    });
  }, []);

  // Update default options in batch engine
  useEffect(() => {
    batchEngine.setDefaultOptions(options);
  }, [batchEngine, options]);

  // Sync options when route or parsed target size changes
  useEffect(() => {
    const kb = parsedTargetConfig.targetKb;
    setTargetKb(kb);
    setOptions((prev) => ({
      ...prev,
      mode: 'target-size',
      targetSizeKb: kb,
      outputFormat: parsedTargetConfig.format,
    }));
  }, [parsedTargetConfig]);

  const currentFile = files[activeFileIndex];

  // Re-run compression when current file changes (in single view mode)
  useEffect(() => {
    if (currentFile && files.length === 1) {
      setResult(null);
      runCompression(currentFile, options);
    }
  }, [currentFile, files.length]);

  const handleUploadSelected = async (newFiles: UploadedFileItem[]) => {
    setFiles(newFiles);
    setActiveFileIndex(0);
    if (newFiles.length > 1) {
      setActiveViewTab('batch');
      await batchEngine.addFiles(newFiles.map((f) => f.file));
    } else {
      setActiveViewTab('single');
    }
  };

  const handleAddMoreFiles = async (newRawFiles: File[]) => {
    const newItems: UploadedFileItem[] = newRawFiles.map((f) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      width: 0,
      height: 0,
      aspectRatio: 1,
      previewUrl: URL.createObjectURL(f),
      lastModified: f.lastModified,
    }));
    setFiles((prev) => [...prev, ...newItems]);
    setActiveViewTab('batch');
  };

  const runCompression = async (file: UploadedFileItem, opt: CompressOptions) => {
    setIsProcessing(true);
    setProcessingStatus('Optimizing fidelity...');
    try {
      const res = await compressImage(file.file, opt);
      setResult(res);
      addToHistory({
        toolId: tool?.id || 'compress-image',
        toolName: tool?.name || 'Compress Image',
        thumbnail: res.dataUrl,
        originalName: file.name,
        originalSize: file.size,
        resultSize: res.resultSize,
        downloadName: res.name,
        blobDataUrl: res.dataUrl,
      });
    } catch (err: any) {
      showToast(err.message || 'Compression failed', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleTargetSizeChange = (newTargetKb: number) => {
    setTargetKb(newTargetKb);
    const updatedOpts: CompressOptions = {
      ...options,
      mode: 'target-size',
      targetSizeKb: newTargetKb,
    };
    setOptions(updatedOpts);
    if (currentFile && files.length === 1) {
      runCompression(currentFile, updatedOpts);
    }
  };

  const handleFormatChange = (fmt: 'auto' | 'image/jpeg' | 'image/webp' | 'image/avif' | 'image/png') => {
    const updatedOpts: CompressOptions = {
      ...options,
      outputFormat: fmt,
    };
    setOptions(updatedOpts);
    if (currentFile && files.length === 1) {
      runCompression(currentFile, updatedOpts);
    }
  };

  const handleQualityModeChange = (mode: 'best-quality' | 'balanced' | 'smallest-file') => {
    const updatedOpts: CompressOptions = {
      ...options,
      qualityMode: mode,
    };
    setOptions(updatedOpts);
    if (currentFile && files.length === 1) {
      runCompression(currentFile, updatedOpts);
    }
  };

  const handleTogglePreserveDimensions = (checked: boolean) => {
    const updatedOpts: CompressOptions = {
      ...options,
      preserveDimensions: checked,
    };
    setOptions(updatedOpts);
    if (currentFile && files.length === 1) {
      runCompression(currentFile, updatedOpts);
    }
  };

  const handleToggleOptimizeText = (checked: boolean) => {
    const updatedOpts: CompressOptions = {
      ...options,
      optimizeForText: checked,
    };
    setOptions(updatedOpts);
    if (currentFile && files.length === 1) {
      runCompression(currentFile, updatedOpts);
    }
  };

  const handleProcess = () => {
    if (currentFile) {
      const updatedOpts: CompressOptions = {
        ...options,
        mode: 'target-size',
        targetSizeKb: targetKb,
      };
      setOptions(updatedOpts);
      runCompression(currentFile, updatedOpts);
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Banner Dimensions bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-5 py-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Intelligent Quality-First Compression Engine
            </span>
            <p className="text-[11px] text-slate-400">
              Multi-pass perceptual scoring with sharp typography & edge preservation
            </p>
          </div>
        </div>

        {parsedTargetConfig.isExactRoute && (
          <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Preset: {parsedTargetConfig.targetKb >= 1000 ? `${parsedTargetConfig.targetKb / 1000}MB` : `${parsedTargetConfig.targetKb}KB`}
          </span>
        )}
      </div>

      {files.length === 0 ? (
        <div className="space-y-6">
          <UploadZone
            onFilesSelected={handleUploadSelected}
            multiple={true}
            maxFileSizeMB={50}
          />

          {/* Quick Target Size Input Selector on upload state */}
          <TargetSizeInput
            targetKb={targetKb}
            onChange={handleTargetSizeChange}
            showPresets={true}
            showSlider={true}
            showComparison={false}
            label="Predefine Target File Size"
          />

          {/* Exact Target Size Navigator */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <ExactTargetSizesGrid currentSlug={parsedTargetConfig.slug} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mode Switcher when multiple images exist */}
          {files.length > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveViewTab('batch')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeViewTab === 'batch'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Batch Queue ({files.length} images)</span>
                </button>
                <button
                  onClick={() => setActiveViewTab('single')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeViewTab === 'single'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Single Inspector ({activeFileIndex + 1}/{files.length})</span>
                </button>
              </div>
              <div className="flex items-center gap-2 pr-2">
                <span className="text-xs text-slate-400 hidden md:inline">
                  Active target: <strong className="text-blue-600 dark:text-blue-400">{targetKb >= 1000 ? `${targetKb / 1000}MB` : `${targetKb}KB`}</strong>
                </span>
                <button
                  onClick={() => {
                    setFiles([]);
                    setResult(null);
                    batchEngine.clearQueue();
                  }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {activeViewTab === 'batch' && files.length > 1 ? (
            <div className="space-y-6">
              {/* Batch Global Compression Settings Toolbar */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Batch Target Size & Format Parameters
                    </h4>
                    <p className="text-xs text-slate-400">
                      Applied across all images in the queue
                    </p>
                  </div>
                </div>

                <TargetSizeInput
                  targetKb={targetKb}
                  onChange={handleTargetSizeChange}
                  showPresets={true}
                  showSlider={true}
                  showComparison={false}
                  label="Target File Size for all images in batch"
                />
              </div>

              {/* Universal Batch Engine Queue */}
              <UniversalBatchQueue
                batchEngine={batchEngine}
                toolName="Compress Image"
                toolSlug="compress"
                currentOptions={options}
                onAddMoreFiles={handleAddMoreFiles}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Compression Strategy</h3>
                    <p className="text-[11px] text-slate-400">
                      Original: {formatFileSize(currentFile.size)} ({currentFile.width}×{currentFile.height}px)
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setFiles([]);
                      setResult(null);
                    }}
                  >
                    Change Image
                  </Button>
                </div>

                {/* Primary Dedicated Target Size Input Component */}
                <TargetSizeInput
                  targetKb={targetKb}
                  onChange={handleTargetSizeChange}
                  originalSizeBytes={currentFile.size}
                  disabled={isProcessing}
                  showPresets={true}
                  showSlider={true}
                  showComparison={true}
                />

                {/* Quality Mode Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Quality Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: 'best-quality',
                        title: 'Best Quality',
                        desc: 'Sharp text & edges',
                        icon: Sparkles,
                      },
                      {
                        id: 'balanced',
                        title: 'Balanced',
                        desc: 'Optimal tradeoff',
                        icon: Sliders,
                      },
                      {
                        id: 'smallest-file',
                        title: 'Smallest',
                        desc: 'High compression',
                        icon: Zap,
                      },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = (options.qualityMode || 'best-quality') === mode.id;
                      return (
                        <Button
                          key={mode.id}
                          variant={isSelected ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleQualityModeChange(mode.id as any)}
                        >
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{mode.title}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Output Format */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Encoding Format
                    </label>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      Auto selects optimal format
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'auto', name: 'Auto', badge: 'Smart Pick' },
                      { id: 'image/webp', name: 'WebP', badge: 'Crisp Text' },
                      { id: 'image/jpeg', name: 'JPEG', badge: 'Standard' },
                      { id: 'image/avif', name: 'AVIF', badge: 'Ultra-Dense' },
                    ].map((fmt) => (
                      <Button
                        key={fmt.id}
                        variant={options.outputFormat === fmt.id ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleFormatChange(fmt.id as any)}
                      >
                        {fmt.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Fidelity Options Switches */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Checkbox
                    checked={options.optimizeForText !== false}
                    onChange={(e) => handleToggleOptimizeText(e.target.checked)}
                    label={
                      <span className="flex items-center gap-1.5 font-medium">
                        <Type className="h-3.5 w-3.5 text-primary shrink-0" />
                        Optimize for typography, lines & fine mockup details
                      </span>
                    }
                  />

                  <Checkbox
                    checked={!!options.preserveDimensions}
                    onChange={(e) => handleTogglePreserveDimensions(e.target.checked)}
                    label={
                      <span className="flex items-center gap-1.5 font-medium">
                        <ImageIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        Preserve 100% original dimensions (no downscaling)
                      </span>
                    }
                  />

                  <Checkbox
                    checked={options.stripMetadata}
                    onChange={(e) => {
                      const next = { ...options, stripMetadata: e.target.checked };
                      setOptions(next);
                      if (currentFile) runCompression(currentFile, next);
                    }}
                    label="Strip EXIF metadata for maximum compression & privacy"
                  />
                </div>

                {/* Big Action Button */}
                <Button
                  id="compress-action-submit-btn"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isProcessing}
                  leftIcon={Minimize2}
                  disabled={!currentFile}
                  onClick={handleProcess}
                >
                  Compress to {targetKb >= 1000 ? `${targetKb / 1000}MB` : `${targetKb}KB`}
                </Button>
              </div>
            </div>

            {/* Result & Live Preview */}
            <div className="lg:col-span-7 space-y-6">
              {/* Degradation Advisory Alert */}
              {result?.qualityMetrics?.isDegraded && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-900/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold">Aggressive Target Size Warning</h4>
                      <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                        {result.qualityMetrics.advisoryMessage ||
                          `${targetKb} KB requires severe compression for this high-resolution image. Typography and gradients may lose clarity.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/80 dark:border-amber-900/60">
                    <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                      Recommended targets for artifact-free clarity:
                    </span>
                    {(result.qualityMetrics.recommendedTargetKb || [100, 200, 300]).map((recKb) => (
                      <button
                        key={recKb}
                        type="button"
                        onClick={() => handleTargetSizeChange(recKb)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-amber-900 text-xs font-bold text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 transition-colors shadow-2xs"
                      >
                        {recKb} KB
                      </button>
                    ))}
                    {options.outputFormat === 'image/jpeg' && (
                      <button
                        type="button"
                        onClick={() => handleFormatChange('image/webp')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-2xs"
                      >
                        Switch to WebP (3x clearer text)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {result ? (
                <ImagePreview originalFile={currentFile} result={result} />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-center dark:border-slate-800 min-h-[420px] flex flex-col items-center justify-center">
                  <img
                    src={currentFile.previewUrl}
                    alt={currentFile.name}
                    className="max-h-[340px] max-w-full rounded-xl object-contain shadow-lg"
                  />
                  <p className="mt-4 text-xs font-mono text-slate-400">
                    Original: {formatFileSize(currentFile.size)} • Processing optimization to {targetKb >= 1000 ? `${targetKb / 1000}MB` : `${targetKb}KB`}...
                  </p>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Exact Target Sizes Grid for quick jumping */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <ExactTargetSizesGrid currentSlug={parsedTargetConfig.slug} />
          </div>
        </div>
      )}
    </div>
  );
};
