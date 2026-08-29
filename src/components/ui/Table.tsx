import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
    <table className={`w-full text-left rtl:text-right text-sm ${className}`} {...rest}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <thead className={`bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${className}`} {...rest}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/60 ${className}`} {...rest}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <tr className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${className}`} {...rest}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <th className={`px-4 py-3.5 ${className}`} {...rest}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <td className={`px-4 py-3.5 text-slate-700 dark:text-slate-200 ${className}`} {...rest}>
    {children}
  </td>
);
