import React, { useState, useEffect, useMemo } from 'react';
import { UploadedFileItem, ProcessedResult, ResizeOptions } from '../../types';
import { resizeImage } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { ImagePreview } from '../common/ImagePreview';
import { UniversalBatchEngine } from '../../engine/batch/UniversalBatchEngine';
import { UniversalBatchQueue } from '../common/UniversalBatchQueue';
import { Lock, Unlock, RefreshCw, Layers, Check, SlidersHorizontal } from 'lucide-react';

export const ResizeToolView: React.FC = () => {
  const { showToast, addToHistory } = useApp();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [activeViewTab, setActiveViewTab] = useState<'single' | 'batch'>('single');

  const [options, setOptions] = useState<ResizeOptions>({
    mode: 'pixels',
    width: 1920,
    height: 1080,
    percentage: 50,
    lockAspectRatio: true,
    interpolation: 'bicubic',
    targetDpi: 300,
    format: 'image/jpeg',
    quality: 0.92,
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

  const currentFile = files[activeFileIndex];

  // Sync initial dimensions when file changes
  useEffect(() => {
    if (currentFile) {
      setAspectRatio(currentFile.width / currentFile.height);
      if (files.length === 1) {
        setOptions((prev) => ({
          ...prev,
          width: currentFile.width,
          height: currentFile.height,
          format: currentFile.type === 'image/png' ? 'image/png' : 'image/jpeg',
        }));
      }
      setResult(null);
    }
  }, [currentFile, files.length]);

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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span>Batch Scaling Factor</span>
                      <span className="font-mono text-blue-600 font-bold">{options.percentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      step="5"
                      value={options.percentage}
                      onChange={(e) => setOptions((prev) => ({ ...prev, percentage: parseInt(e.target.value) }))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Target Width (px)</label>
                      <input
                        type="number"
                        min="1"
                        max="12000"
                        value={options.width}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Target Height (px)</label>
                      <input
                        type="number"
                        min="1"
                        max="12000"
                        value={options.height}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
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
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Width (px)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="12000"
                            value={options.width}
                            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Height (px)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="12000"
                            value={options.height}
                            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Lock Aspect Ratio Toggle */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setOptions((prev) => ({
                              ...prev,
                              lockAspectRatio: !prev.lockAspectRatio,
                            }))
                          }
                          className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          {options.lockAspectRatio ? (
                            <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Unlock className="h-4 w-4 text-slate-400" />
                          )}
                          <span>Lock Aspect Ratio ({aspectRatio ? aspectRatio.toFixed(2) : '1.00'})</span>
                        </button>

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
                      <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>Scale Percentage</span>
                        <span className="font-mono text-blue-600 font-bold">{options.percentage}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="200"
                        step="5"
                        value={options.percentage}
                        onChange={(e) => setOptions((prev) => ({ ...prev, percentage: parseInt(e.target.value) }))}
                        className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
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
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Width ({options.unit || 'cm'})
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={options.width}
                            onChange={(e) => setOptions((prev) => ({ ...prev, width: parseFloat(e.target.value) || 1 }))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Height ({options.unit || 'cm'})
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={options.height}
                            onChange={(e) => setOptions((prev) => ({ ...prev, height: parseFloat(e.target.value) || 1 }))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Popular Presets */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Presets</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
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

                  {/* Output Format Selector */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Export Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setOptions((prev) => ({ ...prev, format: fmt }))}
                          className={`py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                            options.format === fmt
                              ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                              : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {fmt === 'image/jpeg' ? 'JPEG' : fmt === 'image/png' ? 'PNG' : 'WEBP'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Process Button */}
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing || !currentFile}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processing In Browser...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Resize Image Now</span>
                      </>
                    )}
                  </button>
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
        </div>
      )}
    </div>
  );
};
