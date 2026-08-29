import React, { useState, useMemo, useEffect } from 'react';
import { UploadedFileItem, ProcessedResult, SocialResizeOptions, ToolDefinition } from '../../types';
import { createSocialMediaVariant } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { ImagePreview } from '../common/ImagePreview';
import { UniversalBatchEngine } from '../../engine/batch/UniversalBatchEngine';
import { UniversalBatchQueue } from '../common/UniversalBatchQueue';
import {
  Share2,
  RefreshCw,
  Layers,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface SocialResizeToolViewProps {
  tool?: ToolDefinition;
}

export const SocialResizeToolView: React.FC<SocialResizeToolViewProps> = ({ tool }) => {
  const { showToast, addToHistory } = useApp();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');

  const [options, setOptions] = useState<SocialResizeOptions>({
    platform: 'instagram',
    presetId: 'ig-square',
    fitMode: 'blur-fill',
    backgroundColor: '#0F172A',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const currentFile = files[activeFileIndex] || files[0];

  const presets = [
    { id: 'ig-square', platform: 'instagram', name: 'Instagram Square', dim: '1080×1080' },
    { id: 'ig-portrait', platform: 'instagram', name: 'Instagram Portrait', dim: '1080×1350' },
    { id: 'ig-story', platform: 'instagram', name: 'Instagram Story / Reel', dim: '1080×1920' },
    { id: 'yt-thumb', platform: 'youtube', name: 'YouTube Thumbnail', dim: '1280×720' },
    { id: 'yt-banner', platform: 'youtube', name: 'YouTube Banner', dim: '2560×1440' },
    { id: 'fb-post', platform: 'facebook', name: 'Facebook Post', dim: '1200×630' },
    { id: 'tw-post', platform: 'twitter', name: 'X / Twitter Post', dim: '1600×900' },
    { id: 'li-banner', platform: 'linkedin', name: 'LinkedIn Banner', dim: '1584×396' },
    { id: 'tiktok-video', platform: 'tiktok', name: 'TikTok Cover', dim: '1080×1920' },
  ];

  // Initialize Universal Batch Engine
  const batchEngine = useMemo(() => {
    return new UniversalBatchEngine<SocialResizeOptions>({
      concurrency: 4,
      processor: async (file, currentOpt) => {
        return await createSocialMediaVariant(file, currentOpt);
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
      const res = await createSocialMediaVariant(currentFile.file, options);
      setResult(res);
      addToHistory({
        toolId: 'social-resizer',
        toolName: 'Social Media Resizer',
        thumbnail: res.dataUrl,
        originalName: currentFile.name,
        originalSize: currentFile.size,
        resultSize: res.size,
        downloadName: res.name,
        blobDataUrl: res.dataUrl,
      });
      showToast('Formatted for social media!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Formatting failed', 'error');
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
          title="Upload image or drop multiple images for social resizing"
          subtitle="Resize for Instagram, TikTok, YouTube, Facebook, Twitter, and LinkedIn with blur-fill or fit"
        />
      ) : (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Social Media Resizer ({files.length} {files.length === 1 ? 'Image' : 'Images'})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewMode === 'batch'
                    ? 'Converts your entire batch into the selected social format simultaneously'
                    : 'Interactive preview and single-file export'}
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
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Social Target Format</h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {files.length > 1 ? 'Applied to all' : 'Active'}
                  </span>
                </div>

                {/* Preset Cards */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Dimension Target
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setOptions((prev) => ({
                            ...prev,
                            presetId: p.id,
                            platform: p.platform as any,
                          }))
                        }
                        className={`p-2.5 rounded-xl border text-left transition-colors ${
                          options.presetId === p.id
                            ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950'
                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold ${
                            options.presetId === p.id
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {p.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{p.dim}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fit Mode */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Background Fill Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'blur-fill', label: 'Blur Fill' },
                      { id: 'contain', label: 'Solid Fit' },
                      { id: 'cover', label: 'Crop Fill' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setOptions((prev) => ({ ...prev, fitMode: mode.id as any }))}
                        className={`p-2 text-xs font-semibold rounded-xl border transition-colors ${
                          options.fitMode === mode.id
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
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
                        <span>Rendering Preset...</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        <span>Format for Social Media</span>
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
                  toolName="Social Media Resizer"
                  toolSlug="social-resizer"
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
                    Ready to format for {presets.find((p) => p.id === options.presetId)?.name}
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
