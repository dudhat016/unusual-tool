import React from 'react';
import { Breadcrumbs } from '../common/Breadcrumbs';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const seoItems = items.map((i) => ({
    name: i.label,
    url: i.href || '#',
  }));

  return <Breadcrumbs items={seoItems} className={className} />;
};
