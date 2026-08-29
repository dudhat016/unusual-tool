import React, { useState, useRef, useEffect } from 'react';
import { UploadedFileItem } from '../../types';
import { loadFileAsImage, formatFileSize } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadCloud, Camera, Clipboard, X } from 'lucide-react';
import { Button } from '../ui/Button';

export interface UploadZoneProps {
  onFilesSelected?: (files: UploadedFileItem[]) => void;
  onFilesAdded?: (files: UploadedFileItem[]) => void;
  multiple?: boolean;
  acceptMultiple?: boolean;
  maxFileSizeMB?: number;
  acceptedFormats?: string[];
  currentFiles?: UploadedFileItem[];
  files?: UploadedFileItem[];
  onRemoveFile?: ((id: string) => void) | ((index: number) => void);
  onClearAll?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  onFilesAdded,
  multiple = true,
  acceptMultiple,
  maxFileSizeMB = 50,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/x-icon', 'image/svg+xml', 'image/avif', 'image/heic', 'image/heif', 'image/tiff'],
  currentFiles,
  files,
  onRemoveFile,
  onClearAll,
  title,
  subtitle,
  className = '',
  compact = false,
}) => {
  const { showToast } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isMultiple = acceptMultiple !== undefined ? acceptMultiple : multiple;
  const displayFiles = currentFiles || files || [];

  // Emit files to callback
  const notifyFilesSelected = (selected: UploadedFileItem[]) => {
    if (typeof onFilesSelected === 'function') {
      onFilesSelected(selected);
    }
    if (typeof onFilesAdded === 'function') {
      onFilesAdded(selected);
    }
  };

  // Global clipboard paste listener
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        await processRawFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isMultiple, maxFileSizeMB]);

  const processRawFiles = async (rawFiles: File[]) => {
    setIsLoading(true);
    const validItems: UploadedFileItem[] = [];

    const filesToProcess = isMultiple ? rawFiles : rawFiles.slice(0, 1);

    for (const file of filesToProcess) {
      // 1. File size check
      const maxBytes = maxFileSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        showToast(`File "${file.name}" exceeds maximum allowed size of ${maxFileSizeMB} MB`, 'error');
        continue;
      }

      // 2. MIME type check
      if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp|ico|svg|avif|heic|heif|tif|tiff)$/i)) {
        showToast(`File "${file.name}" is not a valid image format`, 'error');
        continue;
      }

      try {
        const { width, height, aspectRatio } = await loadFileAsImage(file);
        const previewUrl = URL.createObjectURL(file);

        validItems.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type || 'image/jpeg',
          width,
          height,
          aspectRatio,
          previewUrl,
          lastModified: file.lastModified,
        });
      } catch (err) {
        showToast(`Failed to parse image "${file.name}". File might be corrupted.`, 'error');
      }
    }

    setIsLoading(false);

    if (validItems.length > 0) {
      notifyFilesSelected(validItems);
      showToast(
        isMultiple ? `Added ${validItems.length} image(s)` : `Loaded "${validItems[0].name}"`,
        'success'
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      await processRawFiles(droppedFiles);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files) as File[];
      await processRawFiles(selectedFiles);
      // Reset input value to allow re-selecting same file
      e.target.value = '';
    }
  };

  const handleRemove = (item: UploadedFileItem, index: number) => {
    if (!onRemoveFile) return;
    // Check if handler expects string id or number index
    (onRemoveFile as any)(item.id !== undefined ? item.id : index, index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        multiple={isMultiple}
        onChange={handleFileInputChange}
        className="hidden"
        id="aetherpix-file-input"
        aria-label="File upload input"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
        id="aetherpix-camera-input"
        aria-label="Camera capture input"
      />

      {/* Main Drop Area */}
      <div
        role="button"
        tabIndex={0}
        aria-label={title || 'Upload files. Choose an image or drag & drop'}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          compact ? 'p-6' : 'p-8 sm:p-12'
        } ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-slate-300/80 bg-slate-50/50 hover:border-primary hover:bg-primary/5 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-primary dark:hover:bg-slate-900/80'
        }`}
      >
        <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <UploadCloud className="h-7 w-7" aria-hidden="true" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {title || (isDragging ? 'Drop your image here' : 'Choose an image or drag & drop')}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle || `Supports JPG, PNG, WEBP, GIF, SVG up to ${maxFileSizeMB}MB`}
            </p>
          </div>

          {/* Action Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={Camera}
              onClick={() => cameraInputRef.current?.click()}
            >
              Camera
            </Button>

            <div className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ctrl+V to Paste</span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Analyzing image...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Files Queue Preview (For Batch or Single View) */}
      {displayFiles.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/70 shadow-2xs">
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500"
          >
            <span>
              {displayFiles.length} file{displayFiles.length > 1 ? 's' : ''} loaded
            </span>
            {onClearAll && displayFiles.length > 1 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-rose-500 hover:underline hover:text-rose-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 rounded"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {displayFiles.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <img
                  src={item.previewUrl}
                  alt={item.name || 'Image preview'}
                  className="h-10 w-10 shrink-0 rounded-md object-cover border border-slate-200 dark:border-slate-800"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.width}×{item.height}px • {formatFileSize(item.size)}
                  </p>
                </div>
                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item, index)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
