import React from 'react';
import { Button, ButtonVariant, ButtonSize } from './Button';
import { useTranslation } from '../../i18n';

export interface DownloadButtonProps {
  onClick: () => void;
  label?: string;
  fileSize?: number;
  format?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  onClick,
  label,
  fileSize,
  format,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  const { t, formatBytes } = useTranslation();
  const text = label || t('buttons.download');

  return (
    <Button
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      leftIcon="Download"
      onClick={onClick}
      className={className}
    >
      <span>{text}</span>
      {(format || fileSize !== undefined) && (
        <span className="opacity-75 font-normal text-xs ml-1">
          ({format ? format.toUpperCase() : ''}
          {format && fileSize !== undefined ? ' • ' : ''}
          {fileSize !== undefined ? formatBytes(fileSize) : ''})
        </span>
      )}
    </Button>
  );
};
