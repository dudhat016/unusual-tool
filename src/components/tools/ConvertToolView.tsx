import React, { useState, useEffect, useMemo } from 'react';
import { UploadedFileItem, UniversalProcessResult, ToolDefinition, ConvertOptions } from '../../types';
import { convertImageFormat, formatFileSize } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { ImagePreview } from '../common/ImagePreview';
import { UniversalBatchEngine } from '../../engine/batch/UniversalBatchEngine';
import { UniversalBatchQueue } from '../common/UniversalBatchQueue';
import {
  RefreshCw,
  Download,
  FileArchive,
  Check,
  Layers,
  Zap,
  Sliders,
  SlidersHorizontal,
} from 'lucide-react';

interface ConvertToolViewProps {
  tool?: ToolDefinition;
}

export const ConvertToolView: React.FC<ConvertToolViewProps> = ({ tool }) => {
  const { showToast, addToHistory } = useApp();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [activeViewTab, setActiveViewTab] = useState<'single' | 'batch'>('single');

  // Derive initial target format from tool if present
  const getInitialFormat = () => {
    if (tool?.slug) {
      if (tool.slug.includes('-to-png')) return 'image/png';
      if (tool.slug.includes('-to-jpg') || tool.slug.includes('-to-jpeg')) return 'image/jpeg';
      if (tool.slug.includes('-to-webp')) return 'image/webp';
      if (tool.slug.includes('-to-svg')) return 'image/svg+xml';
      if (tool.slug.includes('-to-ico')) return 'image/x-icon';
      if (tool.slug.includes('-to-pdf')) return 'application/pdf';
      if (tool.slug.includes('-to-avif')) return 'image/avif';
      if (tool.slug.includes('-to-tiff')) return 'image/tiff';
    }
    return 'image/webp';
  };

  const [targetFormat, setTargetFormat] = useState<string>(getInitialFormat());
  const [quality, setQuality] = useState<number>(0.9);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [singleResult, setSingleResult] = useState<UniversalProcessResult | null>(null);

  const convertOptions: ConvertOptions = useMemo(
    () => ({
      targetFormat,
      quality,
      backgroundColorForTransparent: backgroundColor,
    }),
    [targetFormat, quality, backgroundColor]
  );

  // Batch Engine instance with parallel worker pool
  const batchEngine = useMemo(() => {
    return new UniversalBatchEngine<ConvertOptions>({
      concurrency: 4,
      defaultOptions: convertOptions,
      processor: async (file, opts) => {
        return await convertImageFormat(file, opts);
      },
    });
  }, []);

  useEffect(() => {
    batchEngine.setDefaultOptions(convertOptions);
  }, [batchEngine, convertOptions]);

  useEffect(() => {
    if (tool?.slug) {
      setTargetFormat(getInitialFormat());
    }
  }, [tool?.slug]);

  const currentFile = files[activeFileIndex];

  const handleFilesAdded = async (newFiles: UploadedFileItem[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    if (files.length === 0 && newFiles.length === 1) {
      setActiveFileIndex(0);
      setActiveViewTab('single');
    } else {
      setActiveViewTab('batch');
      await batchEngine.addFiles(newFiles.map((f) => f.file));
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
    setSingleResult(null);
    batchEngine.clearQueue();
  };

  const handleConvertSingle = async () => {
    if (!currentFile) return;
    setIsProcessing(true);
    setProgressMsg('Converting in memory...');

    try {
      const res = await convertImageFormat(currentFile.file, convertOptions);

      setSingleResult(res);

      const targetExt = (targetFormat || '').split('/')[1]?.toUpperCase() || 'IMAGE';
      addToHistory({
        toolId: 'convert-image',
        toolName: `Convert to ${targetExt}`,
        thumbnail: res.dataUrl,
        originalName: currentFile.name,
        originalSize: currentFile.size,
        resultSize: res.resultSize,
        downloadName: res.name,
        blobDataUrl: res.dataUrl,
      });

      showToast(`Successfully converted to ${targetExt}!`, 'success');
    } catch (err: any) {
      console.error('Conversion failed:', err);
      showToast(err.message || 'Conversion failed', 'error');
    } finally {
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  const formatsList = [
    { id: 'image/webp', label: 'WEBP', sub: 'Modern Web / Lightweight', ext: 'webp' },
    { id: 'image/png', label: 'PNG', sub: 'Lossless Transparent', ext: 'png' },
    { id: 'image/jpeg', label: 'JPEG', sub: 'Universal Standard', ext: 'jpg' },
    { id: 'image/avif', label: 'AVIF', sub: 'Next-Gen Compression', ext: 'avif' },
    { id: 'image/x-icon', label: 'ICO', sub: 'Multi-Res Favicon', ext: 'ico' },
    { id: 'image/gif', label: 'GIF', sub: 'Animated Frames', ext: 'gif' },
  ];

  return (
    <div className="space-y-8">
      {files.length === 0 ? (
        <UploadZone
          files={files}
          onFilesSelected={handleFilesAdded}
          onFilesAdded={handleFilesAdded}
          title="Upload images to convert to any format"
          subtitle="Supports WEBP, PNG, JPG, HEIC, TIFF, AVIF, GIF & ICO with 100% in-browser privacy"
          acceptMultiple={true}
          multiple={true}
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

          {/* Global Target Format Selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Select Target Format</h3>
                <p className="text-xs text-slate-400">
                  Target conversion format for {files.length > 1 ? `all ${files.length} images in batch` : currentFile.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {formatsList.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setTargetFormat(fmt.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    targetFormat === fmt.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 dark:border-blue-500 dark:bg-blue-950/70 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm tracking-wide">{fmt.label}</span>
                    {targetFormat === fmt.id && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{fmt.sub}</span>
                </button>
              ))}
            </div>

            {/* Quality Slider (for lossy formats) */}
            {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp' || targetFormat === 'image/avif') && (
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Target Quality</span>
                  <span className="font-mono text-blue-600 font-bold">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {activeViewTab === 'batch' && files.length > 1 ? (
            <UniversalBatchQueue
              batchEngine={batchEngine}
              toolName="Convert Image"
              toolSlug="convert"
              currentOptions={convertOptions}
              onAddMoreFiles={handleAddMoreFiles}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Single File Inspector */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Image Information</h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{currentFile.name}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Source Size:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatFileSize(currentFile.size)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Dimensions:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{currentFile.width} × {currentFile.height} px</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Source Format:</span>
                      <span className="font-mono font-bold text-blue-600 uppercase">{currentFile.type.split('/')[1] || 'IMAGE'}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleConvertSingle}
                    disabled={isProcessing || !currentFile}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>{progressMsg || 'Converting in memory...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        <span>Convert Single Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Preview Area */}
              <div className="lg:col-span-7">
                {singleResult ? (
                  <ImagePreview originalFile={currentFile} result={singleResult} />
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-center dark:border-slate-800 min-h-[380px] flex flex-col items-center justify-center">
                    <img
                      src={currentFile.previewUrl}
                      alt={currentFile.name}
                      className="max-h-[300px] max-w-full rounded-xl object-contain shadow-lg"
                    />
                    <p className="mt-4 text-xs font-mono text-slate-400">
                      Ready to convert to {(targetFormat || '').split('/')[1]?.toUpperCase() || 'IMAGE'}
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
