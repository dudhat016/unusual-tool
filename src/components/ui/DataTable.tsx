import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { Checkbox } from './Checkbox';
import { useTranslation } from '../../i18n';

export interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode | ((props: { column: DataTableColumn<T> }) => React.ReactNode);
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (props: { row: T; value: any; index: number; isSelected: boolean }) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T, direction: 'asc' | 'desc') => number;
  searchable?: boolean;
  searchFn?: (row: T, query: string) => boolean;
  hideable?: boolean;
  defaultHidden?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  minWidth?: string | number;
  exportFormatter?: (row: T) => string | number | boolean | null | undefined;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  enablePagination?: boolean;
  enablePageSize?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableSelection?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[], selectedItems: T[]) => void;
  selectedActions?: React.ReactNode | ((props: { selectedIds: string[]; selectedItems: T[]; clearSelection: () => void }) => React.ReactNode);
  loading?: boolean;
  emptyState?: React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  tableClassName?: string;
  headerActions?: React.ReactNode;
  exportFileName?: string;
  defaultSort?: { columnId: string; direction: 'asc' | 'desc' };
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  subtitle,
  searchPlaceholder = 'Search by title, model, route...',
  enableSearch = true,
  enablePagination = true,
  enablePageSize = true,
  pageSizeOptions = [5, 10, 20, 50, 100],
  defaultPageSize = 10,
  enableColumnVisibility = true,
  enableExport = true,
  enableSelection = false,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  selectedActions,
  loading = false,
  emptyState,
  emptyMessage = 'No records found',
  onRowClick,
  className = '',
  tableClassName = '',
  headerActions,
  exportFileName = 'export_data',
  defaultSort,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortColumnId, setSortColumnId] = useState<string | null>(defaultSort?.columnId || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction || null);

  // Hidden columns state
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    columns.forEach((col) => {
      if (col.defaultHidden) {
        initial.add(col.id);
      }
    });
    return initial;
  });

  // Dropdown states
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  // Selection state (internal fallback if uncontrolled)
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
  const isControlledSelection = controlledSelectedIds !== undefined;
  const currentSelectedIds = isControlledSelection ? controlledSelectedIds! : internalSelectedIds;

  // Refs for click outside
  const columnRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const pageSizeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnRef.current && !columnRef.current.contains(event.target as Node)) {
        setIsColumnDropdownOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target as Node)) {
        setIsPageSizeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter columns based on visibility
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => !hiddenColumnIds.has(col.id));
  }, [columns, hiddenColumnIds]);

  // Search filter calculation
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();
    return data.filter((row) => {
      // Check searchable columns
      return columns.some((col) => {
        if (col.searchable === false) return false;
        if (col.searchFn) return col.searchFn(row, query);

        let val: any;
        if (col.accessorFn) {
          val = col.accessorFn(row);
        } else if (col.accessorKey) {
          val = row[col.accessorKey];
        }

        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, columns, searchQuery]);

  // Sorting calculation
  const sortedData = useMemo(() => {
    if (!sortColumnId || !sortDirection) return filteredData;

    const column = columns.find((col) => col.id === sortColumnId);
    if (!column) return filteredData;

    const copy = [...filteredData];
    copy.sort((a, b) => {
      if (column.sortFn) {
        return column.sortFn(a, b, sortDirection);
      }

      let valA: any;
      let valB: any;

      if (column.accessorFn) {
        valA = column.accessorFn(a);
        valB = column.accessorFn(b);
      } else if (column.accessorKey) {
        valA = a[column.accessorKey];
        valB = b[column.accessorKey];
      }

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (valB === null || valB === undefined) return sortDirection === 'asc' ? -1 : 1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      const comp = strA.localeCompare(strB);
      return sortDirection === 'asc' ? comp : -comp;
    });

    return copy;
  }, [filteredData, sortColumnId, sortDirection, columns]);

  // Pagination calculation
  const totalRecords = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, enablePagination, currentPage, pageSize]);

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const handleHeaderSort = (col: DataTableColumn<T>) => {
    if (col.sortable === false) return;

    if (sortColumnId === col.id) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumnId(null);
        setSortDirection(null);
      }
    } else {
      setSortColumnId(col.id);
      setSortDirection('asc');
    }
  };

  const updateSelection = (newIds: string[]) => {
    if (!isControlledSelection) {
      setInternalSelectedIds(newIds);
    }
    if (onSelectionChange) {
      const selectedMap = new Set(newIds);
      const selectedItems = data.filter((item, index) => selectedMap.has(keyExtractor(item, index)));
      onSelectionChange(newIds, selectedItems);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentIds = paginatedData.map((item, idx) => keyExtractor(item, idx));
      const combined = Array.from(new Set([...currentSelectedIds, ...currentIds]));
      updateSelection(combined);
    } else {
      const pageIdSet = new Set(paginatedData.map((item, idx) => keyExtractor(item, idx)));
      const filtered = currentSelectedIds.filter((id) => !pageIdSet.has(id));
      updateSelection(filtered);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      updateSelection([...currentSelectedIds, id]);
    } else {
      updateSelection(currentSelectedIds.filter((item) => item !== id));
    }
  };

  const isAllPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item, idx) => currentSelectedIds.includes(keyExtractor(item, idx)));

  const isSomePageSelected =
    paginatedData.some((item, idx) => currentSelectedIds.includes(keyExtractor(item, idx))) &&
    !isAllPageSelected;

  const toggleColumnVisibility = (columnId: string) => {
    setHiddenColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const resetColumnVisibility = () => {
    const initial = new Set<string>();
    columns.forEach((col) => {
      if (col.defaultHidden) {
        initial.add(col.id);
      }
    });
    setHiddenColumnIds(initial);
  };

  // Export CSV / JSON / PDF
  const handleExportCSV = () => {
    const exportColumns = columns.filter((col) => !hiddenColumnIds.has(col.id));
    const rowsToExport = currentSelectedIds.length > 0
      ? data.filter((item, idx) => currentSelectedIds.includes(keyExtractor(item, idx)))
      : sortedData;

    const headers = exportColumns
      .map((col) => `"${typeof col.header === 'string' ? col.header : col.id}"`)
      .join(',');

    const rows = rowsToExport
      .map((row) =>
        exportColumns
          .map((col) => {
            let val: any;
            if (col.exportFormatter) {
              val = col.exportFormatter(row);
            } else if (col.accessorFn) {
              val = col.accessorFn(row);
            } else if (col.accessorKey) {
              val = row[col.accessorKey];
            }
            const str = String(val ?? '');
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const csvContent = `\uFEFF${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportDropdownOpen(false);
  };

  const handleExportJSON = () => {
    const exportColumns = columns.filter((col) => !hiddenColumnIds.has(col.id));
    const rowsToExport = currentSelectedIds.length > 0
      ? data.filter((item, idx) => currentSelectedIds.includes(keyExtractor(item, idx)))
      : sortedData;

    const formattedData = rowsToExport.map((row) => {
      const obj: Record<string, any> = {};
      exportColumns.forEach((col) => {
        let val: any;
        if (col.exportFormatter) {
          val = col.exportFormatter(row);
        } else if (col.accessorFn) {
          val = col.accessorFn(row);
        } else if (col.accessorKey) {
          val = row[col.accessorKey];
        }
        obj[col.id] = val;
      });
      return obj;
    });

    const blob = new Blob([JSON.stringify(formattedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportDropdownOpen(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Title & Subtitle Header if provided */}
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            {title && (
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {/* Batch Selection Banner */}
      {enableSelection && currentSelectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-slate-900 dark:text-white font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-[11px]">
              {currentSelectedIds.length}
            </span>
            <span>items selected</span>
          </div>

          <div className="flex items-center gap-2">
            {typeof selectedActions === 'function'
              ? selectedActions({
                  selectedIds: currentSelectedIds,
                  selectedItems: data.filter((item, idx) => currentSelectedIds.includes(keyExtractor(item, idx))),
                  clearSelection: () => updateSelection([]),
                })
              : selectedActions}
            <button
              type="button"
              onClick={() => updateSelection([])}
              className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Top Toolbar Bar (Exact Promptly Aesthetics) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left Side: Search Bar */}
        {enableSearch && (
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon name="Search" size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Icon name="X" size={14} />
              </button>
            )}
          </div>
        )}

        {/* Right Side Controls: Page Limit, Column Toggle, Export */}
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          {/* Page Limit Dropdown Trigger */}
          {enablePageSize && (
            <div ref={pageSizeRef} className="relative">
              <button
                type="button"
                onClick={() => setIsPageSizeOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-purple-400 dark:hover:border-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                <span className="font-mono">{pageSize}</span>
                <span className="text-slate-400 dark:text-slate-500 font-medium">/ page</span>
                <Icon
                  name="ChevronDown"
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${isPageSizeOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isPageSizeOpen && (
                <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                    Rows per page
                  </div>
                  {pageSizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setIsPageSizeOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        pageSize === size
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-primary/10'
                      }`}
                    >
                      <span className="font-mono">{size} rows</span>
                      {pageSize === size && <Icon name="Check" size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Columns Visibility Toggle Button */}
          {enableColumnVisibility && (
            <div ref={columnRef} className="relative">
              <button
                type="button"
                onClick={() => setIsColumnDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:border-purple-400 dark:hover:border-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                <Icon name="Sliders" size={14} className="text-slate-400" />
                <span>COLUMNS</span>
                <span className="text-[10px] font-mono text-slate-400 ml-0.5">
                  ({visibleColumns.length}/{columns.length})
                </span>
              </button>

              {isColumnDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                    <span>Visible Columns</span>
                    <button
                      type="button"
                      onClick={resetColumnVisibility}
                      className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                    {columns.map((col) => {
                      const isVisible = !hiddenColumnIds.has(col.id);
                      const isHideable = col.hideable !== false;
                      const headerTitle = typeof col.header === 'string' ? col.header : col.id;

                      return (
                        <div key={col.id} className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <Checkbox
                            label={headerTitle}
                            checked={isVisible}
                            disabled={!isHideable}
                            onChange={() => isHideable && toggleColumnVisibility(col.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export Button */}
          {enableExport && (
            <div ref={exportRef} className="relative">
              <button
                type="button"
                onClick={() => setIsExportDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black tracking-wider uppercase shadow-md shadow-primary/30 transition-all cursor-pointer"
              >
                <Icon name="Download" size={14} className="stroke-[2.5]" />
                <span>EXPORT</span>
                <Icon
                  name="ChevronDown"
                  size={12}
                  className={`transition-transform duration-200 ${isExportDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isExportDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                    Export Format
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Icon name="FileText" size={14} className="text-primary" />
                    <span>CSV Spreadsheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Icon name="Layers" size={14} className="text-primary" />
                    <span>JSON Payload</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Table Outer Container */}
      <div className={`w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl ${tableClassName}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header Row */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider select-none">
                {enableSelection && (
                  <th className="w-10 px-4 py-3.5 text-center">
                    <Checkbox
                      checked={isAllPageSelected}
                      indeterminate={isSomePageSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                )}

                {visibleColumns.map((col) => {
                  const isSorted = sortColumnId === col.id;
                  const isSortable = col.sortable !== false;

                  return (
                    <th
                      key={col.id}
                      style={{
                        width: col.width,
                        minWidth: col.minWidth,
                        textAlign: col.align || 'left',
                      }}
                      onClick={() => isSortable && handleHeaderSort(col)}
                      className={`px-4 py-3.5 transition-colors ${
                        isSortable ? 'cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800/80' : ''
                      } ${isSorted ? 'text-primary' : ''}`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 ${
                          col.align === 'right'
                            ? 'justify-end'
                            : col.align === 'center'
                            ? 'justify-center'
                            : 'justify-start'
                        }`}
                      >
                        <span>
                          {typeof col.header === 'function' ? col.header({ column: col }) : col.header}
                        </span>

                        {isSortable && (
                          <span className="text-slate-400">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <Icon name="ChevronUp" size={13} className="text-primary stroke-[2.5]" />
                              ) : (
                                <Icon name="ChevronDown" size={13} className="text-primary stroke-[2.5]" />
                              )
                            ) : (
                              <span className="text-[11px] opacity-60">⇅</span>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, rIdx) => (
                  <tr key={`skel-${rIdx}`} className="animate-pulse">
                    {enableSelection && (
                      <td className="px-4 py-4 text-center">
                        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={`skel-col-${col.id}`} className="px-4 py-4">
                        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, index) => {
                  const rowId = keyExtractor(row, index);
                  const isSelected = currentSelectedIds.includes(rowId);

                  return (
                    <tr
                      key={rowId}
                      onClick={() => onRowClick?.(row, index)}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-primary/10 dark:bg-primary/20'
                          : 'hover:bg-primary/5 dark:hover:bg-primary/10'
                      } ${onRowClick ? 'cursor-pointer' : ''}`}
                    >
                      {enableSelection && (
                        <td className="w-10 px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                          />
                        </td>
                      )}

                      {visibleColumns.map((col) => {
                        let value: any;
                        if (col.accessorFn) {
                          value = col.accessorFn(row);
                        } else if (col.accessorKey) {
                          value = row[col.accessorKey];
                        }

                        return (
                          <td
                            key={col.id}
                            style={{ textAlign: col.align || 'left' }}
                            className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-medium"
                          >
                            {col.cell
                              ? col.cell({ row, value, index, isSelected })
                              : value !== null && value !== undefined
                              ? String(value)
                              : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (enableSelection ? 1 : 0)}
                    className="py-16 px-4 text-center"
                  >
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <Icon name="Search" size={18} />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{emptyMessage}</p>
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            Clear search filter
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination & Records Indicator Bar */}
        {enablePagination && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-xs">
            {/* Records Range Counter */}
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-extrabold text-slate-900 dark:text-white">{startRecord}–{endRecord}</span> of{' '}
              <span className="font-extrabold text-slate-900 dark:text-white">{totalRecords}</span> records
            </div>

            {/* Pagination Button Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                aria-label="First page"
              >
                «
              </button>

              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }).map((_, pIdx) => {
                const pageNum = pIdx + 1;
                if (totalPages > 7 && Math.abs(pageNum - currentPage) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={`ellipsis-${pageNum}`} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                }

                const isActive = pageNum === currentPage;

                return (
                  <button
                    key={`page-${pageNum}`}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                        : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                aria-label="Next page"
              >
                ›
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage(totalPages)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                aria-label="Last page"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const CommonTable = DataTable;
