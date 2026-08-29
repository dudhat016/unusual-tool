import React, { useState, useMemo, useEffect } from 'react';
import { UploadedFileItem, ProcessedResult, EffectsOptions, ToolDefinition } from '../../types';
import { applyPhotoEffects } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { ImagePreview } from '../common/ImagePreview';
import { UniversalBatchEngine } from '../../engine/batch/UniversalBatchEngine';
import { UniversalBatchQueue } from '../common/UniversalBatchQueue';
import {
  Wand2,
  RefreshCw,
  RotateCcw,
  Layers,
  Eye,
  SlidersHorizontal,
  Sun,
  Contrast,
  Droplets,
  Sparkles,
} from 'lucide-react';

interface EffectsToolViewProps {
  tool?: ToolDefinition;
}

export const EffectsToolView: React.FC<EffectsToolViewProps> = ({ tool }) => {
  const { showToast, addToHistory } = useApp();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');

  const [effects, setEffects] = useState<EffectsOptions>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    sharpen: 0,
    grayscale: false,
    sepia: 0,
    invert: false,
    vintage: false,
    pixelate: 1,
    vignette: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const currentFile = files[activeFileIndex] || files[0];

  // Initialize Universal Batch Engine
  const batchEngine = useMemo(() => {
    return new UniversalBatchEngine<EffectsOptions>({
      concurrency: 4,
      processor: async (file, currentOpt) => {
        return await applyPhotoEffects(file, currentOpt);
      },
      defaultOptions: effects,
    });
  }, []);

  // Sync batch options whenever adjustments change
  useEffect(() => {
    batchEngine.setDefaultOptions(effects);
  }, [batchEngine, effects]);

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
      const res = await applyPhotoEffects(currentFile.file, effects);
      setResult(res);
      addToHistory({
        toolId: 'photo-effects',
        toolName: 'Photo Effects & Filters',
        thumbnail: res.dataUrl,
        originalName: currentFile.name,
        originalSize: currentFile.size,
        resultSize: res.size,
        downloadName: res.name,
        blobDataUrl: res.dataUrl,
      });
      showToast('Applied creative photo effects!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Effect application failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetEffects = () => {
    setEffects({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      sharpen: 0,
      grayscale: false,
      sepia: 0,
      invert: false,
      vintage: false,
      pixelate: 1,
      vignette: 0,
    });
    setResult(null);
  };

  return (
    <div className="space-y-8">
      {files.length === 0 ? (
        <UploadZone
          onFilesSelected={handleFilesSelected}
          multiple={true}
          maxFileSizeMB={50}
          title="Upload image or drop multiple photos for adjustments"
          subtitle="Adjust brightness, saturation, contrast, blur, sepia, or artistic filters in single or batch mode"
        />
      ) : (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Photo Adjustments & Filters ({files.length} {files.length === 1 ? 'Image' : 'Images'})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewMode === 'batch'
                    ? 'Adjusts and filters all queued photos simultaneously in-browser'
                    : 'Interactive photo grading and single-photo export'}
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
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Grading & Effects</h3>
                  <button
                    onClick={resetEffects}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Sliders: Brightness, Contrast, Saturation */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span>Brightness</span>
                      <span className="font-mono">{effects.brightness > 0 ? `+${effects.brightness}` : effects.brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={effects.brightness}
                      onChange={(e) => setEffects((prev) => ({ ...prev, brightness: parseInt(e.target.value) }))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span>Contrast</span>
                      <span className="font-mono">{effects.contrast > 0 ? `+${effects.contrast}` : effects.contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={effects.contrast}
                      onChange={(e) => setEffects((prev) => ({ ...prev, contrast: parseInt(e.target.value) }))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span>Saturation</span>
                      <span className="font-mono">{effects.saturation > 0 ? `+${effects.saturation}` : effects.saturation}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={effects.saturation}
                      onChange={(e) => setEffects((prev) => ({ ...prev, saturation: parseInt(e.target.value) }))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span>Blur / Soft Focus</span>
                      <span className="font-mono">{effects.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={effects.blur}
                      onChange={(e) => setEffects((prev) => ({ ...prev, blur: parseInt(e.target.value) }))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>

                {/* Preset Filters Checkboxes / Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Artistic Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEffects((prev) => ({ ...prev, grayscale: !prev.grayscale }))}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                        effects.grayscale
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      B&W Grayscale
                    </button>

                    <button
                      type="button"
                      onClick={() => setEffects((prev) => ({ ...prev, vintage: !prev.vintage }))}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                        effects.vintage
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      Vintage Tone
                    </button>

                    <button
                      type="button"
                      onClick={() => setEffects((prev) => ({ ...prev, sepia: prev.sepia > 0 ? 0 : 70 }))}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                        effects.sepia > 0
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      Warm Sepia
                    </button>

                    <button
                      type="button"
                      onClick={() => setEffects((prev) => ({ ...prev, invert: !prev.invert }))}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                        effects.invert
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      Invert Colors
                    </button>
                  </div>
                </div>

                {/* Single Image Action Button */}
                {viewMode === 'single' && (
                  <button
                    onClick={handleSingleApply}
                    disabled={isProcessing || !currentFile}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Rendering Effects...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        <span>Apply Effects</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {viewMode === 'batch' ? (
                <UniversalBatchQueue
                  batchEngine={batchEngine}
                  toolName="Photo Effects & Filters"
                  toolSlug="photo-effects"
                  currentOptions={effects}
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
                    Ready to apply custom adjustments
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
