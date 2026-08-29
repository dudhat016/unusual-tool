import React from 'react';
import * as Icons from 'lucide-react';

export type IconName = keyof typeof Icons | string;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  color,
  ...rest
}) => {
  const IconComponent = (Icons as Record<string, any>)[name];

  if (!IconComponent) {
    const Fallback = Icons.HelpCircle;
    return <Fallback size={size} className={className} color={color} {...rest} />;
  }

  return <IconComponent size={size} className={className} color={color} {...rest} />;
};
