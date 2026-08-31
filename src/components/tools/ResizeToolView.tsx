import React, { useState, useEffect, useMemo } from 'react';
import { UploadedFileItem, ProcessedResult, ResizeOptions } from '../../types';
import { resizeImage } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { ImagePreview } from '../common/ImagePreview';
import { UniversalBatchEngine } from '../../engine/batch/UniversalBatchEngine';
import { UniversalBatchQueue } from '../common/UniversalBatchQueue';
import { Slider } from '../ui/Slider';
import { NumberInput } from '../ui/NumberInput';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Lock, Unlock, RefreshCw, Layers, Check, SlidersHorizontal, Sparkles } from 'lucide-react';
import { SOCIAL_PRESETS_MAP } from '../../config/targetSizeTools';
import { CropModal } from '../common/CropModal';

export const ResizeToolView: React.FC = () => {
  const { showToast, addToHistory } = useApp();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [activeViewTab, setActiveViewTab] = useState<'single' | 'batch'>('single');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [options, setOptions] = useState<ResizeOptions & { cropBounds?: { x: number; y: number; width: number; height: number } }>({
    mode: 'pixels',
    width: 1920,
    height: 1080,
    percentage: 50,
    lockAspectRatio: true,
    interpolation: 'bicubic',
    targetDpi: 300,
    format: 'image/jpeg',
    quality: 0.92,
    fitMode: 'stretch',
  });

  const [aspectRatio, setAspectRatio] = useState<number>(1.777);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  // Batch Engine instance with parallel worker pool
  const batchEngine = useMemo(() => {
    return new UniversalBatchEngine<ResizeOptions>({
      concurrency: 4,
      defaultOptions: options,
      processor: async (file, opts) => {
        return await resizeImage(file, opts);
      },
    });
  }, []);

  useEffect(() => {
    batchEngine.setDefaultOptions(options);
  }, [batchEngine, options]);

  const [activePresetInfo, setActivePresetInfo] = useState<{
    title: string;
    width?: number;
    height?: number;
    targetKb?: number;
    platform?: string;
    isCustomOverridden?: boolean;
  } | null>(null);

  // Parse route parameters on mount to auto-prefill preset dimensions or formats
  useEffect(() => {
    const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').toLowerCase();
    const segments = path.split('/');
    const slug = segments[segments.length - 1] || path;

    // 1. Social Media Presets (/resize-image-for-instagram)
    const socialMatch = slug.match(/^resize-(?:image|photo|picture)-for-([a-z0-9-]+)$/i);
    if (socialMatch) {
      const platformKey = socialMatch[1].toLowerCase();
      const preset = SOCIAL_PRESETS_MAP[platformKey];
      if (preset) {
        setOptions((prev) => ({
          ...prev,
          mode: 'pixels',
          width: preset.width,
          height: preset.height,
          lockAspectRatio: true,
        }));
        setAspectRatio(preset.width / preset.height);
        setActivePresetInfo({
          title: preset.name,
          width: preset.width,
          height: preset.height,
          platform: preset.platform,
        });
        return;
      }
    }

    // 2. Pixel Dimensions (/resize-image-to-1920x1080)
    const dimMatch = slug.match(/^resize-(?:image|photo|picture)-to-(\d+)x(\d+)$/i);
    if (dimMatch) {
      const w = parseInt(dimMatch[1], 10);
      const h = parseInt(dimMatch[2], 10);
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        setOptions((prev) => ({
          ...prev,
          mode: 'pixels',
          width: w,
          height: h,
          lockAspectRatio: true,
        }));
        setAspectRatio(w / h);
        setActivePresetInfo({
          title: `Dimension Preset: ${w} × ${h} px`,
          width: w,
          height: h,
        });
        return;
      }
    }

    // 3. Format Specific Preset (/resize-png-to-200kb)
    const fmtMatch = slug.match(/^resize-(png|webp|jpeg|jpg)-to-(\d+)(kb|mb)$/i);
    if (fmtMatch) {
      const rawFmt = fmtMatch[1].toLowerCase();
      const targetFmt = rawFmt === 'png' ? 'image/png' : rawFmt === 'webp' ? 'image/webp' : 'image/jpeg';
      const num = parseInt(fmtMatch[2], 10);
      const unit = fmtMatch[3].toLowerCase();
      const targetKb = unit === 'mb' ? num * 1000 : num;

      setOptions((prev) => ({
        ...prev,
        format: targetFmt,
      }));
      setActivePresetInfo({
        title: `Format & Size Preset: ${rawFmt.toUpperCase()} under ${num}${unit.toUpperCase()}`,
        targetKb,
      });
    }
  }, []);

  const currentFile = files[activeFileIndex];

  // Sync initial dimensions when file changes (only when no preset is active)
  useEffect(() => {
    if (currentFile) {
      setAspectRatio(currentFile.width / currentFile.height);
      if (files.length === 1 && !activePresetInfo) {
        setOptions((prev) => ({
          ...prev,
          width: currentFile.width,
          height: currentFile.height,
          format: currentFile.type === 'image/png' ? 'image/png' : 'image/jpeg',
        }));
      }
      setResult(null);
    }
  }, [currentFile, files.length, activePresetInfo]);

  const handleWidthChange = (w: number) => {
    const newW = Math.max(1, w);
    if (options.lockAspectRatio && aspectRatio > 0) {
      const newH = Math.round(newW / aspectRatio);
      setOptions((prev) => ({ ...prev, width: newW, height: newH }));
    } else {
      setOptions((prev) => ({ ...prev, width: newW }));
    }
  };

  const handleHeightChange = (h: number) => {
    const newH = Math.max(1, h);
    if (options.lockAspectRatio && aspectRatio > 0) {
      const newW = Math.round(newH * aspectRatio);
      setOptions((prev) => ({ ...prev, width: newW, height: newH }));
    } else {
      setOptions((prev) => ({ ...prev, height: newH }));
    }
  };

  const applyPreset = (w: number, h: number, name: string) => {
    setOptions((prev) => ({
      ...prev,
      mode: 'pixels',
      width: w,
      height: h,
      lockAspectRatio: false,
    }));
    showToast(`Applied preset: ${name} (${w}×${h}px)`, 'info');
  };

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

  const handleClearAll = () => {
    setFiles([]);
    setResult(null);
    batchEngine.clearQueue();
  };

  const handleProcess = async () => {
    if (!currentFile) return;
    setIsProcessing(true);
    try {
      const res = await resizeImage(currentFile.file, options);
      setResult(res);
      addToHistory({
        toolId: 'resize-image',
        toolName: 'Resize Image',
        thumbnail: res.dataUrl,
        originalName: currentFile.name,
        originalSize: currentFile.size,
        resultSize: res.size,
        downloadName: res.name,
        blobDataUrl: res.dataUrl,
      });
      showToast('Image resized successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to resize image', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      {files.length === 0 ? (
        <UploadZone
          onFilesSelected={handleUploadSelected}
          multiple={true}
          maxFileSizeMB={50}
        />
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
                <button
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {activeViewTab === 'batch' && files.length > 1 ? (
            <div className="space-y-6">
              {/* Batch Global Resize Settings Bar */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Batch Resize Configuration</h3>
                    <p className="text-xs text-slate-400">Settings applied to all {files.length} images in the queue</p>
                  </div>
                </div>

                {/* Mode Selection Tabs */}
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
                  {(['pixels', 'percentage'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setOptions((prev) => ({ ...prev, mode }))}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                        options.mode === mode
                          ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {mode === 'percentage' ? 'Scale by Percentage (%)' : 'Fit to Dimensions (px)'}
                    </button>
                  ))}
                </div>

                {options.mode === 'percentage' ? (
                  <Slider
                    label="Batch Scaling Factor"
                    min={5}
                    max={200}
                    step={5}
                    value={options.percentage}
                    unit="%"
                    onChange={(v) => setOptions((prev) => ({ ...prev, percentage: v }))}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput
                      label="Target Width (px)"
                      min={1}
                      max={12000}
                      value={options.width}
                      onChange={(v) => handleWidthChange(v || 1)}
                    />
                    <NumberInput
                      label="Target Height (px)"
                      min={1}
                      max={12000}
                      value={options.height}
                      onChange={(v) => handleHeightChange(v || 1)}
                    />
                  </div>
                )}
              </div>

              <UniversalBatchQueue
                batchEngine={batchEngine}
                toolName="Resize Image"
                toolSlug="resize"
                currentOptions={options}
                onAddMoreFiles={handleAddMoreFiles}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Controls Settings Panel */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Resize Settings</h3>
                    <button
                      onClick={handleClearAll}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                    >
                      Clear All
                    </button>
                  </div>
                  {/* Preset Aware Locked View vs Manual Control Inputs */}
                  {activePresetInfo && !activePresetInfo.isCustomOverridden ? (
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {activePresetInfo.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-primary/20 text-primary shrink-0">
                          Preset Active
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {activePresetInfo.width && activePresetInfo.height && (
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-semibold">Dimensions</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              {options.width} × {options.height} px
                            </span>
                          </div>
                        )}
                        {activePresetInfo.platform && (
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-semibold">Platform</span>
                            <span className="font-bold text-primary text-sm">
                              {activePresetInfo.platform}
                            </span>
                          </div>
                        )}
                        {activePresetInfo.targetKb && (
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-semibold">Target Size Limit</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                              {activePresetInfo.targetKb >= 1000 ? `${activePresetInfo.targetKb / 1000} MB` : `${activePresetInfo.targetKb} KB`}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setActivePresetInfo((prev) => prev ? { ...prev, isCustomOverridden: true } : null)}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer pt-1 flex items-center gap-1.5"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>Override & Customize Manual Dimensions</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Mode Selection Tabs */}
                      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
                        {(['pixels', 'percentage', 'units'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setOptions((prev) => ({ ...prev, mode }))}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                              options.mode === mode
                                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>

                      {/* Mode Specific Inputs */}
                      {options.mode === 'pixels' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <NumberInput
                              label="Width (px)"
                              min={1}
                              max={12000}
                              value={options.width}
                              onChange={(v) => handleWidthChange(v || 1)}
                            />
                            <NumberInput
                              label="Height (px)"
                              min={1}
                              max={12000}
                              value={options.height}
                              onChange={(v) => handleHeightChange(v || 1)}
                            />
                          </div>

                          {/* Lock Aspect Ratio Toggle */}
                          <div className="flex items-center justify-between pt-1">
                            <Checkbox
                              checked={options.lockAspectRatio}
                              onChange={(e) =>
                                setOptions((prev) => ({
                                  ...prev,
                                  lockAspectRatio: e.target.checked,
                                }))
                              }
                              label={`Lock Aspect Ratio (${aspectRatio ? aspectRatio.toFixed(2) : '1.00'})`}
                            />

                            <button
                              type="button"
                              onClick={() => {
                                if (currentFile) {
                                  setOptions((prev) => ({
                                    ...prev,
                                    width: currentFile.width,
                                    height: currentFile.height,
                                  }));
                                }
                              }}
                              className="text-xs text-blue-600 hover:underline cursor-pointer"
                            >
                              Reset to Original
                            </button>
                          </div>
                        </div>
                      )}

                      {options.mode === 'percentage' && (
                        <div className="space-y-3">
                          <Slider
                            label="Scale Percentage"
                            min={5}
                            max={200}
                            step={5}
                            value={options.percentage}
                            unit="%"
                            onChange={(v) => setOptions((prev) => ({ ...prev, percentage: v }))}
                          />
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>25% (Thumb)</span>
                            <span>50% (Medium)</span>
                            <span>100% (Original)</span>
                            <span>200% (Double)</span>
                          </div>
                          {currentFile && (
                            <p className="text-xs text-slate-500 pt-1">
                              Result: ~{Math.round((currentFile.width * options.percentage) / 100)}×
                              {Math.round((currentFile.height * options.percentage) / 100)}px
                            </p>
                          )}
                        </div>
                      )}

                      {options.mode === 'units' && (
                        <div className="space-y-4">
                          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
                            {(['cm', 'mm', 'inches'] as const).map((unit) => (
                              <button
                                key={unit}
                                onClick={() => setOptions((prev) => ({ ...prev, unit }))}
                                className={`flex-1 py-1 text-xs font-semibold rounded uppercase ${
                                  options.unit === unit
                                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                                    : 'text-slate-500'
                                }`}
                              >
                                {unit}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <NumberInput
                              label={`Width (${options.unit || 'cm'})`}
                              min={0.1}
                              max={500}
                              value={options.widthUnit || 10}
                              onChange={(v) => setOptions((prev) => ({ ...prev, widthUnit: v || 10 }))}
                            />
                            <NumberInput
                              label={`Height (${options.unit || 'cm'})`}
                              min={0.1}
                              max={500}
                              value={options.heightUnit || 10}
                              onChange={(v) => setOptions((prev) => ({ ...prev, heightUnit: v || 10 }))}
                            />
                          </div>
                        </div>
                      )}

                      {/* Presets Grid */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Quick Presets
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => applyPreset(1080, 1080, 'Instagram Square')}
                            className="rounded-lg border border-slate-200 p-2 text-left text-xs hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">Instagram</p>
                            <p className="text-[10px] text-slate-400">1080×1080 px</p>
                          </button>
                          <button
                            onClick={() => applyPreset(1280, 720, 'YouTube Thumbnail')}
                            className="rounded-lg border border-slate-200 p-2 text-left text-xs hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">YouTube</p>
                            <p className="text-[10px] text-slate-400">1280×720 px</p>
                          </button>
                          <button
                            onClick={() => applyPreset(1920, 1080, 'Full HD 1080p')}
                            className="rounded-lg border border-slate-200 p-2 text-left text-xs hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">Full HD</p>
                            <p className="text-[10px] text-slate-400">1920×1080 px</p>
                          </button>
                          <button
                            onClick={() => applyPreset(1200, 630, 'Facebook Post')}
                            className="rounded-lg border border-slate-200 p-2 text-left text-xs hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">Facebook</p>
                            <p className="text-[10px] text-slate-400">1200×630 px</p>
                          </button>
                          <button
                            onClick={() => applyPreset(600, 600, 'Passport 2x2')}
                            className="rounded-lg border border-slate-200 p-2 text-left text-xs hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">Passport</p>
                            <p className="text-[10px] text-slate-400">600×600 px</p>
                          </button>
                          <button
                            onClick={() => applyPreset(2480, 3508, 'A4 Document')}
                            className="rounded-lg border border-slate-200 p-2 text-left text-xs hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">A4 300DPI</p>
                            <p className="text-[10px] text-slate-400">2480×3508 px</p>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Fit Options Selector (imresizer style) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 dark:text-white">
                        Resize Fit Mode
                      </label>
                      {currentFile && options.width && options.height && Math.abs((options.width / options.height) - (currentFile.width / currentFile.height)) > 0.05 && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                          ⚠️ Aspect ratio differs — choose fit
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'stretch', label: 'Stretch image', desc: 'Stretch exact' },
                        { id: 'crop', label: 'Crop', desc: 'Center crop' },
                        { id: 'pad', label: 'Add Padding', desc: 'Fit with blur' },
                        { id: 'fill', label: 'Fill Frame', desc: 'Cover frame' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setOptions((prev) => ({ ...prev, fitMode: item.id as any }));
                            if (item.id === 'crop') {
                              setIsCropModalOpen(true);
                            }
                          }}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-0.5 ${
                            (options.fitMode || 'stretch') === item.id
                              ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 shadow-2xs font-bold'
                              : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 font-medium'
                          }`}
                        >
                          <span className="text-xs">{item.label}</span>
                          <span className="text-[9px] text-slate-400 leading-tight block">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Output Format Selector */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Export Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                        <Button
                          key={fmt}
                          variant={options.format === fmt ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setOptions((prev) => ({ ...prev, format: fmt }))}
                        >
                          {fmt === 'image/jpeg' ? 'JPEG' : fmt === 'image/png' ? 'PNG' : 'WEBP'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Process Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isProcessing}
                    leftIcon={RefreshCw}
                    disabled={!currentFile}
                    onClick={handleProcess}
                  >
                    Resize Image Now
                  </Button>
                </div>
              </div>

              {/* Result & Live Preview */}
              <div className="lg:col-span-7 space-y-6">
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
                      Current: {currentFile.width}×{currentFile.height}px • Click "Resize Image Now" to apply settings
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentFile && (
            <CropModal
              isOpen={isCropModalOpen}
              onClose={() => setIsCropModalOpen(false)}
              imageSrc={currentFile.previewUrl}
              originalWidth={currentFile.width || 1000}
              originalHeight={currentFile.height || 1000}
              targetWidth={options.width}
              targetHeight={options.height}
              onApplyCrop={(cropData) => {
                setOptions((prev) => ({
                  ...prev,
                  fitMode: 'crop',
                  cropBounds: cropData,
                }));
                showToast('Custom crop area applied!', 'success');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
