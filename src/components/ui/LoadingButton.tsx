import React from 'react';
import { Button, ButtonProps } from './Button';

export interface LoadingButtonProps extends ButtonProps {
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  children,
  ...rest
}) => {
  return (
    <Button loading={loading} {...rest}>
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};
