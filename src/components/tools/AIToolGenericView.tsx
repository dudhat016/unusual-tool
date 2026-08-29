import React, { useState, useMemo, useEffect } from 'react';
import { UploadedFileItem, ProcessedResult, ToolDefinition } from '../../types';
import { runAIToolProcess, formatFileSize } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { ImagePreview } from '../common/ImagePreview';
import { UniversalBatchEngine } from '../../engine/batch/UniversalBatchEngine';
import { UniversalBatchQueue } from '../common/UniversalBatchQueue';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import {
  Sparkles,
  RefreshCw,
  Zap,
  Sliders,
  Eraser,
  Brush,
  Bookmark,
  ShieldAlert,
  Layers,
  Eye,
} from 'lucide-react';

interface AIToolGenericViewProps {
  tool: ToolDefinition;
}

export const AIToolGenericView: React.FC<AIToolGenericViewProps> = ({ tool }) => {
  const {
    showToast,
    addToHistory,
    consumeCredits,
    logJob,
    userProfile,
    savePreset,
    checkResolution,
    checkFileSize,
    checkAiQuota,
  } = useApp();

  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  // AI Tool Specific options
  const [upscaleFactor, setUpscaleFactor] = useState<'2x' | '4x'>('2x');
  const [bgThreshold, setBgThreshold] = useState<number>(45);
  const [brushSize, setBrushSize] = useState<number>(25);

  const currentFile = files[activeFileIndex] || files[0];

  const currentOptions = useMemo(() => {
    return {
      scale: upscaleFactor,
      threshold: bgThreshold,
      brushSize,
    };
  }, [upscaleFactor, bgThreshold, brushSize]);

  // Initialize Universal Batch Engine
  const batchEngine = useMemo(() => {
    return new UniversalBatchEngine<typeof currentOptions>({
      concurrency: 2, // 2 concurrent neural workers to prevent browser thread freeze
      processor: async (file, options) => {
        return await runAIToolProcess(file, tool.slug, options);
      },
      defaultOptions: currentOptions,
    });
  }, [tool.slug]);

  // Sync batch options whenever controls change
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

  const handleFilesSelected = async (newItems: UploadedFileItem[]) => {
    batchEngine.clear();
    const rawFiles = newItems.map((item) => item.file);
    await batchEngine.addFiles(rawFiles);
    setFiles(newItems);
    setActiveFileIndex(0);
    setResult(null);
  };

  const handleRunAI = async () => {
    if (!currentFile) return;

    // 1. Quota & Rate Limit Check
    const quotaCheck = checkAiQuota();
    if (!quotaCheck.allowed) {
      showToast(quotaCheck.reason || 'AI rate limit reached.', 'error');
      return;
    }

    // 2. Resolution Safeguard Check
    const resCheck = checkResolution(currentFile.width, currentFile.height);
    if (!resCheck.allowed) {
      showToast(resCheck.message || 'Resolution exceeds plan limit.', 'error');
      return;
    }

    // 3. File Size Check
    const sizeCheck = checkFileSize(currentFile.size);
    if (!sizeCheck.allowed) {
      showToast(sizeCheck.message || 'File size exceeds plan limit.', 'error');
      return;
    }

    // 4. Ledger-backed credit debit
    if (tool.creditCost > 0) {
      const allowed = await consumeCredits(
        tool.creditCost,
        `AI Processing: ${tool.name} on ${currentFile.name}`,
        tool.id
      );
      if (!allowed) return;
    }

    setIsProcessing(true);
    const startTime = performance.now();

    try {
      const res = await runAIToolProcess(currentFile.file, tool.slug, currentOptions);
      const executionTime = Math.round(performance.now() - startTime);

      setResult(res);

      // Local session history
      addToHistory({
        toolId: tool.id,
        toolName: tool.name,
        thumbnail: res.dataUrl,
        originalName: currentFile.name,
        originalSize: currentFile.size,
        resultSize: res.size,
        downloadName: res.name,
        blobDataUrl: res.dataUrl,
      });

      // SaaS Cloud Job Telemetry (zero permanent image storage)
      await logJob({
        toolId: tool.id,
        toolName: tool.name,
        status: 'completed',
        processorType: 'ai',
        fileName: currentFile.name,
        originalSize: currentFile.size,
        resultSize: res.size,
        originalWidth: currentFile.width,
        originalHeight: currentFile.height,
        resultWidth: res.width,
        resultHeight: res.height,
        processingTimeMs: executionTime,
        creditsCharged: tool.creditCost,
      });

      showToast(`${tool.name} completed successfully in ${executionTime}ms!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'AI processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePreset = () => {
    savePreset(`${tool.name} Settings`, tool.id, currentOptions);
  };

  return (
    <div className="space-y-8">
      {files.length === 0 ? (
        <UploadZone
          onFilesSelected={handleFilesSelected}
          multiple={true}
          maxFileSizeMB={tool.maxFileSizeMB}
          title={`Upload photo or drop images for ${tool.name}`}
          subtitle={`Hardware-accelerated neural image transformation — Supports single and batch processing`}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {tool.name} ({files.length} {files.length === 1 ? 'Image' : 'Images'})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewMode === 'batch'
                    ? `Runs ${tool.name} in parallel across all queued images`
                    : 'Interactive preview and single-photo export'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {files.length > 1 && (
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  <Button
                    variant={viewMode === 'batch' ? 'primary' : 'ghost'}
                    size="xs"
                    leftIcon={Layers}
                    onClick={() => setViewMode('batch')}
                  >
                    Batch Queue ({files.length})
                  </Button>
                  <Button
                    variant={viewMode === 'single' ? 'primary' : 'ghost'}
                    size="xs"
                    leftIcon={Eye}
                    onClick={() => setViewMode('single')}
                  >
                    Single Inspector
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  batchEngine.clear();
                  setFiles([]);
                  setResult(null);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* AI Controls Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">AI Configuration</h3>
                  </div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {files.length > 1 ? 'Applied to all' : 'Active'}
                  </span>
                </div>

                {/* Tool-specific interactive controls */}
                {tool.slug === 'image-upscaler' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Upscale Resolution Factor
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['2x', '4x'] as const).map((factor) => (
                        <Button
                          key={factor}
                          variant={upscaleFactor === factor ? 'primary' : 'outline'}
                          size="md"
                          onClick={() => setUpscaleFactor(factor)}
                        >
                          {factor} Super-Res
                        </Button>
                      ))}
                    </div>
                    {currentFile && (
                      <p className="text-xs font-mono text-slate-500 pt-1">
                        Output Target: {currentFile.width * (upscaleFactor === '4x' ? 4 : 2)}×
                        {currentFile.height * (upscaleFactor === '4x' ? 4 : 2)}px
                      </p>
                    )}
                  </div>
                )}

                {tool.slug === 'background-remover' && (
                  <div className="space-y-3">
                    <Slider
                      label="Edge Sensitivity / Tolerance"
                      min={15}
                      max={90}
                      step={1}
                      value={bgThreshold}
                      onChange={(v) => setBgThreshold(v)}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Crisp Subject Edges</span>
                      <span>Standard Matting</span>
                      <span>Broad Background</span>
                    </div>
                  </div>
                )}

                {tool.slug === 'object-remover' && (
                  <div className="space-y-3">
                    <Slider
                      label="Highlighter Brush Size"
                      min={5}
                      max={80}
                      step={1}
                      value={brushSize}
                      unit="px"
                      onChange={(v) => setBrushSize(v)}
                    />
                    <p className="text-[11px] text-slate-500">
                      Paint over unwanted items, watermarks, or objects.
                    </p>
                  </div>
                )}

                {/* Credit Cost Badge & Save Preset */}
                <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-950 dark:bg-indigo-950/30">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                        Cost: {tool.creditCost} Credits
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        Ledger balance: {userProfile ? userProfile.credits : 'Guest'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSavePreset}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 p-1 rounded-sm hover:bg-indigo-100 dark:hover:bg-indigo-900"
                    title="Save current parameters to cloud presets"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Save Preset</span>
                  </button>
                </div>

                {/* Action Button for Single Mode */}
                {viewMode === 'single' && (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isProcessing}
                    leftIcon={Sparkles}
                    disabled={!currentFile}
                    onClick={handleRunAI}
                  >
                    Run {tool.name}
                  </Button>
                )}
              </div>
            </div>

            {/* Result Area / Universal Batch Queue */}
            <div className="lg:col-span-7 space-y-6">
              {viewMode === 'batch' ? (
                <UniversalBatchQueue
                  batchEngine={batchEngine}
                  toolName={tool.name}
                  toolSlug={tool.slug}
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
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-center dark:border-slate-800 min-h-[420px] flex flex-col items-center justify-center">
                  <img
                    src={currentFile.previewUrl}
                    alt={currentFile.name}
                    className="max-h-[340px] max-w-full rounded-xl object-contain shadow-lg"
                  />
                  <p className="mt-4 text-xs font-mono text-slate-400">
                    Ready to transform with {tool.name}
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
