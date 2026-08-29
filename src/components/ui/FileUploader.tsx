import React from 'react';
import { UploadZone } from '../common/UploadZone';

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
  maxSizeBytes = 100 * 1024 * 1024,
  title,
  subtitle,
  className = '',
}) => {
  const maxMb = Math.round(maxSizeBytes / (1024 * 1024));

  return (
    <UploadZone
      multiple={multiple}
      maxFileSizeMB={maxMb || 50}
      title={title}
      subtitle={subtitle}
      className={className}
      acceptedFormats={accept ? accept.split(',') : undefined}
      onFilesSelected={(items) => {
        const rawFiles = items.map((item) => item.file);
        if (rawFiles.length > 0) {
          onFilesSelected(rawFiles);
        }
      }}
    />
  );
};
