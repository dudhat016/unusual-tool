import React, { useState } from 'react';
import { UniversalProcessResult, ProcessedResult, UploadedFileItem } from '../../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { DownloadBar } from './DownloadBar';
import { formatFileSize } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { Copy, Check } from 'lucide-react';

interface ImagePreviewProps {
  originalFile?: UploadedFileItem;
  result: UniversalProcessResult | ProcessedResult;
  onDownload?: () => void;
  onReprocess?: () => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalFile,
  result,
  onDownload,
  onReprocess,
  className = '',
}) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);

  // Normalize result to ensure all UniversalProcessResult fields are present
  const normalizedResult: UniversalProcessResult = {
    id: result.id,
    originalFile: result.originalFile || (originalFile?.file as File),
    resultFile: result.resultFile || new File([result.blob], result.name, { type: result.type }),
    originalSize: result.originalSize || originalFile?.size || 0,
    resultSize: result.resultSize !== undefined ? result.resultSize : result.size,
    originalWidth: result.originalWidth || originalFile?.width || 0,
    originalHeight: result.originalHeight || originalFile?.height || 0,
    resultWidth: result.resultWidth || result.width,
    resultHeight: result.resultHeight || result.height,
    processingTime: result.processingTime !== undefined ? result.processingTime : (result as any).processingTimeMs || 0,
    toolId: result.toolId || 'image-processor',
    status: result.status || 'completed',
    processorType: result.processorType || 'browser',
    blob: result.blob,
    dataUrl: result.dataUrl,
    downloadUrl: result.downloadUrl,
    name: result.name,
    type: result.type,
    reductionPercentage: result.reductionPercentage,
    extractedText: result.extractedText,
    metadata: result.metadata,
    palette: result.palette,
  };

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        showToast('Clipboard API not supported in this browser', 'error');
        return;
      }
      const item = new ClipboardItem({ [normalizedResult.type || 'image/png']: normalizedResult.blob });
      await navigator.clipboard.write([item]);
      setCopied(true);
      showToast('Image copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy image to clipboard', 'error');
    }
  };

  const origDetails = originalFile
    ? `${originalFile.width}×${originalFile.height} (${formatFileSize(originalFile.size)})`
    : normalizedResult.originalWidth
    ? `${normalizedResult.originalWidth}×${normalizedResult.originalHeight} (${formatFileSize(normalizedResult.originalSize)})`
    : undefined;

  const procDetails = `${normalizedResult.resultWidth}×${normalizedResult.resultHeight} (${formatFileSize(normalizedResult.resultSize)})`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Before / After Slider with Drag, Zoom, Fullscreen, Mobile Support */}
      {originalFile || normalizedResult.originalFile ? (
        <BeforeAfterSlider
          originalUrl={originalFile?.previewUrl || (normalizedResult.originalFile ? URL.createObjectURL(normalizedResult.originalFile) : normalizedResult.dataUrl)}
          processedUrl={normalizedResult.dataUrl}
          originalLabel="BEFORE"
          processedLabel="AFTER"
          originalDetails={origDetails}
          processedDetails={procDetails}
          className="w-full"
        />
      ) : (
        <div className="relative rounded-2xl border border-slate-200 bg-slate-950 p-4 text-center dark:border-slate-800 flex items-center justify-center min-h-[360px]">
          <img
            src={normalizedResult.dataUrl}
            alt={normalizedResult.name}
            className="max-h-[460px] max-w-full object-contain mx-auto rounded-lg"
          />
        </div>
      )}

      {/* Quick Clipboard Copy button */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          title="Copy image blob to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
        </button>
      </div>

      {/* Comprehensive Universal Download & Metrics Bar */}
      <DownloadBar
        result={normalizedResult}
        onReprocess={onReprocess}
      />
    </div>
  );
};
