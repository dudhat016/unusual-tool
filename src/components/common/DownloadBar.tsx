import React, { useState } from 'react';
import {
  Download,
  FileCode,
  CheckCircle2,
  Clock,
  Sparkles,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Settings2,
} from 'lucide-react';
import { UniversalProcessResult } from '../../types';
import { formatFileSize } from '../../engine/imageEngine';
import { Slider } from '../ui/Slider';
import { Input } from '../ui/Input';

interface DownloadBarProps {
  result: UniversalProcessResult;
  onReprocess?: () => void;
  className?: string;
}

export const DownloadBar: React.FC<DownloadBarProps> = ({
  result,
  onReprocess,
  className = '',
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customFormat, setCustomFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [customQuality, setCustomQuality] = useState<number>(0.92);
  const [customName, setCustomName] = useState<string>(() => {
    return result.name.replace(/\.[^/.]+$/, '');
  });
  const [isExporting, setIsExporting] = useState(false);

  const isCompressed = result.originalSize > result.resultSize && result.resultSize > 0;
  const savingsPercent = isCompressed
    ? Math.round(((result.originalSize - result.resultSize) / result.originalSize) * 100)
    : 0;

  const handleDirectDownload = () => {
    const a = document.createElement('a');
    a.href = result.downloadUrl;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCustomExport = async () => {
    setIsExporting(true);
    try {
      // Re-encode from current blob via offscreen canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const imgUrl = URL.createObjectURL(result.blob);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = result.resultWidth || img.width;
      canvas.height = result.resultHeight || img.height;
      const ctx = canvas.getContext('2d');

      if (customFormat === 'image/jpeg') {
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      const exportedBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || result.blob), customFormat, customQuality);
      });

      const ext = customFormat === 'image/png' ? 'png' : customFormat === 'image/webp' ? 'webp' : 'jpg';
      const finalFileName = `${customName.trim() || 'export'}.${ext}`;

      const exportUrl = URL.createObjectURL(exportedBlob);
      const a = document.createElement('a');
      a.href = exportUrl;
      a.download = finalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(imgUrl);
      setTimeout(() => URL.revokeObjectURL(exportUrl), 5000);
      setShowCustomModal(false);
    } catch {
      // Fallback
      handleDirectDownload();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Universal Result Metrics Panel */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Size change */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              File Size
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatFileSize(result.resultSize)}
              </span>
              {isCompressed && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  -{savingsPercent}%
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5">
              from {formatFileSize(result.originalSize)}
            </span>
          </div>

          {/* Dimensions */}
          <div className="flex flex-col sm:pl-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Resolution
            </span>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
              {result.resultWidth} × {result.resultHeight}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5">
              orig: {result.originalWidth} × {result.originalHeight}
            </span>
          </div>

          {/* Processing Time */}
          <div className="flex flex-col pt-3 sm:pt-0 sm:pl-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Processing Time
            </span>
            <div className="mt-1 flex items-center gap-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{result.processingTime} ms</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5">Zero network latency</span>
          </div>

          {/* Engine & Privacy */}
          <div className="flex flex-col pt-3 sm:pt-0 sm:pl-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Processing Engine
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              {result.processorType === 'ai' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3.5 h-3.5" /> AI Engine
                </span>
              ) : result.processorType === 'server' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
                  <Layers className="w-3.5 h-3.5" /> Server Engine
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                  <Cpu className="w-3.5 h-3.5" /> Browser Canvas
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> 100% Private
            </span>
          </div>
        </div>

        {/* Quality Metrics & Strategy banner if available */}
        {result.qualityMetrics && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Perceptual Quality Score:
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                    result.qualityMetrics.qualityScore >= 85
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : result.qualityMetrics.qualityScore >= 70
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {result.qualityMetrics.qualityScore}/100 • {result.qualityMetrics.qualityGrade}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>SSIM: <strong>{result.qualityMetrics.ssim}</strong></span>
                <span>PSNR: <strong>{result.qualityMetrics.psnr} dB</strong></span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Optimization Strategy:</span>
              <span className="italic">{result.qualityMetrics.strategy}</span>
            </div>

            {result.qualityMetrics.advisoryMessage && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                <strong>Quality Advisory:</strong> {result.qualityMetrics.advisoryMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Download Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onReprocess && (
            <button
              onClick={onReprocess}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
            >
              Adjust Settings
            </button>
          )}

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
          >
            <Settings2 className="w-4 h-4 text-slate-500" />
            <span>Download As...</span>
          </button>
        </div>

        <button
          onClick={handleDirectDownload}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 active:scale-[0.99] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Result ({formatFileSize(result.resultSize)})</span>
        </button>
      </div>

      {/* Custom Export "Download As..." Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Custom Export Settings
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filename */}
            <Input
              label="File Name"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />

            {/* Format choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setCustomFormat(fmt)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      customFormat === fmt
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {fmt.split('/')[1].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality slider for JPEG/WebP */}
            {customFormat !== 'image/png' && (
              <div className="space-y-2">
                <Slider
                  label="Quality"
                  min={10}
                  max={100}
                  step={5}
                  value={Math.round(customQuality * 100)}
                  unit="%"
                  onChange={(v) => setCustomQuality(v / 100)}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomExport}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Export & Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
