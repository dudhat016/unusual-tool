import React, { useState, useRef, useCallback } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { useTranslation } from '../../i18n';

export interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  accept,
  multiple = true,
  maxFiles = 50,
  maxSizeBytes = 100 * 1024 * 1024, // 100MB
  title,
  subtitle,
  disabled = false,
  className = '',
}) => {
  const { t, formatBytes } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const raw = Array.from(fileList);
      const valid = raw
        .filter((file) => file.size <= maxSizeBytes)
        .slice(0, maxFiles);

      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    },
    [maxSizeBytes, maxFiles, onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, processFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
        // Reset input
        e.target.value = '';
      }
    },
    [processFiles]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
        isDragOver
          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.008]'
          : 'border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
      />

      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-xs">
        <Icon name="UploadCloud" size={32} />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
        {title || t('upload.dropFilesHere')}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        {subtitle || t('common.clickToBrowse')}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          leftIcon="FolderOpen"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {t('buttons.selectFiles')}
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Icon name="ShieldCheck" size={13} className="text-emerald-500" />
          {t('common.privacyBadge')}
        </span>
        <span>•</span>
        <span>{t('upload.maxFileSize', { size: formatBytes(maxSizeBytes) })}</span>
      </div>
    </div>
  );
};
