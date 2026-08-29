import React from 'react';
import { useApp } from '../../context/AppContext';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({ href, children, className = '', onClick, ...props }) => {
  const { navigate } = useApp();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    if (e.defaultPrevented) return;

    const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    const isLeftClick = e.button === 0;

    // SPA Client-side routing for standard left clicks on internal links
    if (
      isLeftClick &&
      !isModified &&
      href &&
      !href.startsWith('http://') &&
      !href.startsWith('https://') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('#')
    ) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};
