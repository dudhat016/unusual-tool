import React, { useState } from 'react';
import { Button, ButtonVariant, ButtonSize } from './Button';
import { IconButton } from './IconButton';
import { useTranslation } from '../../i18n';

export interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  label,
  copiedLabel,
  variant = 'secondary',
  size = 'sm',
  iconOnly = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const defaultLabel = label || t('buttons.copy');
  const defaultCopiedLabel = copiedLabel || t('buttons.copied');

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (iconOnly) {
    return (
      <IconButton
        icon={copied ? 'Check' : 'Copy'}
        aria-label={copied ? defaultCopiedLabel : defaultLabel}
        size={size}
        variant={copied ? 'primary' : variant}
        onClick={handleCopy}
        className={className}
      />
    );
  }

  return (
    <Button
      variant={copied ? 'success' : variant}
      size={size}
      leftIcon={copied ? 'Check' : 'Copy'}
      onClick={handleCopy}
      className={className}
    >
      {copied ? defaultCopiedLabel : defaultLabel}
    </Button>
  );
};
