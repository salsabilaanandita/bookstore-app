// src/components/ui/Table.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from './Icon';
import { Skeleton } from './Skeleton';
import { Pagination } from './Pagination';

export function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found',
  emptySubMessage = 'Try adjusting your filters or search term.',
  keyField = 'id',
  onRowClick,
  pageSize = 20,
  paginated = true,
  className = ''
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when data length changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !data) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const comp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [data, sortKey, sortDirection]);

  // Paginated slice
  const totalPages = paginated ? Math.ceil((sortedData?.length || 0) / pageSize) : 1;
  const displayedData = useMemo(() => {
    if (!paginated || !sortedData) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, paginated, currentPage, pageSize]);

  return (
    <div className={`w-full overflow-hidden border border-border rounded-card bg-surface shadow-subtle flex flex-col ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-subtle/50 text-xs font-semibold text-text-secondary">
              {columns.map((col) => (
                <th
                  key={col.key || col.accessor}
                  onClick={() => col.sortable && handleSort(col.accessor || col.key)}
                  className={`px-4 py-3 select-none ${col.sortable ? 'cursor-pointer hover:text-text-primary' : ''} ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-text-tertiary">
                        {sortKey === (col.accessor || col.key) ? (
                          sortDirection === 'asc' ? <Icon name="ChevronUp" size={14} /> : <Icon name="ChevronDown" size={14} />
                        ) : (
                          <Icon name="ChevronsUpDown" size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm text-text-primary">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skel-row-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`skel-col-${cIdx}`} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayedData && displayedData.length > 0 ? (
              displayedData.map((row, rIdx) => (
                <tr
                  key={row[keyField] || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface-subtle/60' : 'hover:bg-surface-subtle/30'}`}
                >
                  {columns.map((col) => {
                    const value = col.accessor ? row[col.accessor] : undefined;
                    return (
                      <td key={col.key || col.accessor} className={`px-4 py-3.5 ${col.cellClassName || ''}`}>
                        {col.render ? col.render(value, row, rIdx) : (value ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-text-secondary">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-xs mx-auto">
                    <div className="p-3 bg-surface-subtle rounded-full text-text-tertiary">
                      <Icon name="Inbox" size={24} />
                    </div>
                    <p className="font-semibold text-text-primary text-sm">{emptyMessage}</p>
                    <p className="text-xs text-text-tertiary">{emptySubMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {paginated && sortedData && sortedData.length > pageSize && (
        <div className="border-t border-border px-3 bg-surface">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedData.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
export default Table;
