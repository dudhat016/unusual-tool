import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UploadedFileItem, ProcessedResult, CropRect, ToolDefinition } from '../../types';
import { cropImage } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { ImagePreview } from '../common/ImagePreview';
import { UniversalBatchEngine } from '../../engine/batch/UniversalBatchEngine';
import { UniversalBatchQueue } from '../common/UniversalBatchQueue';
import {
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Circle,
  Square,
  Check,
  RefreshCw,
  Layers,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface CropOptionsWithExtra extends CropRect {
  targetFormat: 'image/png' | 'image/jpeg' | 'image/webp';
  quality: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  normalized?: {
    relX: number;
    relY: number;
    relWidth: number;
    relHeight: number;
  };
}

interface CropToolViewProps {
  tool?: ToolDefinition;
}

export const CropToolView: React.FC<CropToolViewProps> = ({ tool }) => {
  const { showToast, addToHistory } = useApp();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');

  const [cropRect, setCropRect] = useState<CropRect>({
    x: 50,
    y: 50,
    width: 400,
    height: 400,
    aspectRatioPreset: '1:1',
  });

  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const currentFile = files[activeFileIndex] || files[0];

  // Initialize crop box to 80% center when file loads
  useEffect(() => {
    if (currentFile) {
      const w = Math.round(currentFile.width * 0.8);
      const h = Math.round(currentFile.height * 0.8);
      const x = Math.round((currentFile.width - w) / 2);
      const y = Math.round((currentFile.height - h) / 2);
      setCropRect({ x, y, width: w, height: h, aspectRatioPreset: '1:1' });
      setResult(null);
    }
  }, [currentFile?.id]);

  // Combined options for batch processor
  const currentOptions: CropOptionsWithExtra = useMemo(() => {
    const fw = currentFile?.width || 1000;
    const fh = currentFile?.height || 1000;
    return {
      x: cropRect.x,
      y: cropRect.y,
      width: cropRect.width,
      height: cropRect.height,
      aspectRatioPreset: cropRect.aspectRatioPreset,
      targetFormat: exportFormat,
      quality: 0.95,
      rotation,
      flipHorizontal: flipH,
      flipVertical: flipV,
      normalized: {
        relX: cropRect.x / fw,
        relY: cropRect.y / fh,
        relWidth: cropRect.width / fw,
        relHeight: cropRect.height / fh,
      },
    };
  }, [cropRect, exportFormat, rotation, flipH, flipV, currentFile]);

  // Initialize Universal Batch Engine
  const batchEngine = useMemo(() => {
    const engine = new UniversalBatchEngine<CropOptionsWithExtra>({
      concurrency: 4,
      processor: async (file, options) => {
        return await cropImage(file, options, options.targetFormat, options.quality);
      },
      defaultOptions: currentOptions,
    });
    return engine;
  }, []);

  // Update batch processor default options whenever settings change
  useEffect(() => {
    batchEngine.setDefaultOptions(currentOptions);
  }, [batchEngine, currentOptions]);

  // Auto switch mode when files count changes
  useEffect(() => {
    if (files.length > 1) {
      setViewMode('batch');
    } else {
      setViewMode('single');
    }
  }, [files.length]);

  const handleFilesAdded = async (newItems: UploadedFileItem[]) => {
    const rawFiles = newItems.map((item) => item.file);
    await batchEngine.addFiles(rawFiles);
    setFiles((prev) => [...prev, ...newItems]);
  };

  const handleFilesSelected = async (newItems: UploadedFileItem[]) => {
    batchEngine.clear();
    const rawFiles = newItems.map((item) => item.file);
    await batchEngine.addFiles(rawFiles);
    setFiles(newItems);
    setActiveFileIndex(0);
    setResult(null);
  };

  const applyPresetRatio = (preset: CropRect['aspectRatioPreset']) => {
    if (!currentFile) return;
    const fw = currentFile.width;
    const fh = currentFile.height;

    let w = Math.min(fw, fh);
    let h = w;

    if (preset === '1:1' || preset === 'circle') {
      w = Math.min(fw, fh) * 0.8;
      h = w;
    } else if (preset === '16:9') {
      w = fw * 0.85;
      h = w * (9 / 16);
      if (h > fh) {
        h = fh * 0.85;
        w = h * (16 / 9);
      }
    } else if (preset === '4:3') {
      w = fw * 0.85;
      h = w * (3 / 4);
      if (h > fh) {
        h = fh * 0.85;
        w = h * (4 / 3);
      }
    } else if (preset === '9:16') {
      h = fh * 0.85;
      w = h * (9 / 16);
      if (w > fw) {
        w = fw * 0.85;
        h = w * (16 / 9);
      }
    } else if (preset === '3:2') {
      w = fw * 0.85;
      h = w * (2 / 3);
      if (h > fh) {
        h = fh * 0.85;
        w = h * (3 / 2);
      }
    } else if (preset === '2:3') {
      h = fh * 0.85;
      w = h * (2 / 3);
      if (w > fw) {
        w = fw * 0.85;
        h = w * (3 / 2);
      }
    }

    const x = Math.round((fw - w) / 2);
    const y = Math.round((fh - h) / 2);

    setCropRect({
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.round(w),
      height: Math.round(h),
      aspectRatioPreset: preset,
    });

    showToast(`Aspect ratio set to ${preset}`, 'info');
  };

  const handleSingleCrop = async () => {
    if (!currentFile) return;
    setIsProcessing(true);
    try {
      const res = await cropImage(currentFile.file, currentOptions, exportFormat, 0.95);
      setResult(res);
      addToHistory({
        toolId: 'crop-image',
        toolName: 'Crop Image',
        thumbnail: res.dataUrl,
        originalName: currentFile.name,
        originalSize: currentFile.size,
        resultSize: res.size,
        downloadName: res.name,
        blobDataUrl: res.dataUrl,
      });
      showToast('Image cropped successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Crop failed', 'error');
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
          title="Upload image or drop multiple images to crop"
          subtitle="Supports JPG, PNG, WebP, GIF, BMP, AVIF, HEIC — 100% private in-browser crop"
        />
      ) : (
        <div className="space-y-6">
          {/* Top Bar: View Mode Switcher (if multiple files) & Reset */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Crop className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Crop & Frame ({files.length} {files.length === 1 ? 'Image' : 'Images'})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewMode === 'batch'
                    ? 'Batch mode applies your selected aspect ratio or normalized crop across all queue images'
                    : 'Interactive canvas preview and coordinate refinement'}
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

          {/* Settings & Configuration Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Crop Settings</h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {files.length > 1 ? 'Applied to all' : 'Interactive'}
                  </span>
                </div>

                {/* Aspect Ratio Presets */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Aspect Ratio Presets
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {[
                      { id: '1:1', label: '1:1 Square' },
                      { id: '16:9', label: '16:9 Wide' },
                      { id: '4:3', label: '4:3 Standard' },
                      { id: '9:16', label: '9:16 Story' },
                      { id: '3:2', label: '3:2 Classic' },
                      { id: 'circle', label: 'Circle' },
                      { id: 'free', label: 'Freeform' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPresetRatio(preset.id as any)}
                        className={`p-2 rounded-xl border text-center text-xs font-semibold transition-colors ${
                          cropRect.aspectRatioPreset === preset.id
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orientation & Flip Controls */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Rotate & Flip
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                        rotation !== 0
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>{rotation}°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFlipH((prev) => !prev)}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                        flipH
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <FlipHorizontal className="h-3.5 w-3.5" />
                      <span>Flip H</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFlipV((prev) => !prev)}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                        flipV
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <FlipVertical className="h-3.5 w-3.5" />
                      <span>Flip V</span>
                    </button>
                  </div>
                </div>

                {/* Export Format */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setExportFormat(fmt)}
                        className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                          exportFormat === fmt
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                            : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {fmt === 'image/png' ? 'PNG (Crisp)' : fmt === 'image/jpeg' ? 'JPEG' : 'WEBP'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Single Image Action Button (when in single view or 1 file) */}
                {viewMode === 'single' && (
                  <button
                    onClick={handleSingleCrop}
                    disabled={isProcessing || !currentFile}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Cropping Canvas...</span>
                      </>
                    ) : (
                      <>
                        <Crop className="h-4 w-4" />
                        <span>Apply Crop ({cropRect.width}×{cropRect.height}px)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Preview Canvas OR Result */}
            <div className="lg:col-span-7 space-y-6">
              {viewMode === 'batch' ? (
                <UniversalBatchQueue
                  batchEngine={batchEngine}
                  toolName="Crop Image"
                  toolSlug="crop-image"
                  currentOptions={currentOptions}
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
                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-center dark:border-slate-800 flex flex-col items-center justify-center relative min-h-[420px]">
                  <div className="relative inline-block overflow-hidden rounded-xl border border-slate-800">
                    <img
                      src={currentFile.previewUrl}
                      alt={currentFile.name}
                      className="max-h-[380px] w-auto object-contain block opacity-75"
                    />
                    {/* Visual Cropper Box Overlay */}
                    <div
                      className={`absolute border-2 border-blue-400 bg-blue-500/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all ${
                        cropRect.aspectRatioPreset === 'circle' ? 'rounded-full' : 'rounded-xs'
                      }`}
                      style={{
                        left: `${(cropRect.x / (currentFile.width || 1000)) * 100}%`,
                        top: `${(cropRect.y / (currentFile.height || 1000)) * 100}%`,
                        width: `${(cropRect.width / (currentFile.width || 1000)) * 100}%`,
                        height: `${(cropRect.height / (currentFile.height || 1000)) * 100}%`,
                      }}
                    >
                      <div className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-white">
                        {cropRect.width}×{cropRect.height}px
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-slate-400">
                    Pick an aspect ratio or click "Apply Crop" to render
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
