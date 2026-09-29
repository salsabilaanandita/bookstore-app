// src/components/ui/Pagination.jsx
import React from 'react';
import { Icon } from './Icon';

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize = 20,
  onPageChange,
  className = ''
}) {
  if (totalPages <= 1 && (!totalItems || totalItems <= pageSize)) {
    return null;
  }

  const startItem = totalItems ? Math.min((currentPage - 1) * pageSize + 1, totalItems) : (currentPage - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none ${className}`}>
      {/* Range text info */}
      <div className="text-xs text-text-secondary font-medium order-2 sm:order-1">
        {totalItems != null ? (
          <>
            Showing <span className="font-semibold text-text-primary">{startItem}</span> -{' '}
            <span className="font-semibold text-text-primary">{endItem}</span> of{' '}
            <span className="font-semibold text-text-primary">{totalItems}</span> items
          </>
        ) : (
          <>
            Page <span className="font-semibold text-text-primary">{currentPage}</span> of{' '}
            <span className="font-semibold text-text-primary">{totalPages}</span>
          </>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Prev Button */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          className="h-8 px-2.5 rounded-lg border border-border bg-surface text-text-primary text-xs font-semibold hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1"
        >
          <Icon name="ChevronLeft" size={14} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-text-tertiary">
                  ...
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange && onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          className="h-8 px-2.5 rounded-lg border border-border bg-surface text-text-primary text-xs font-semibold hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <Icon name="ChevronRight" size={14} />
        </button>
      </div>
    </div>
  );
}
export default Pagination;
