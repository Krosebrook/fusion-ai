import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Pagination({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  pageSize = 20,
  totalItems = 0,
  showInfo = true,
  className = ''
}) {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {showInfo && totalItems > 0 && (
        <div className="text-sm text-gray-400">
          Showing {startItem}-{endItem} of {totalItems} items
        </div>
      )}

      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev}
          className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page Numbers */}
        {getPageNumbers().map(page => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'ghost'}
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 ${
              page === currentPage 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {page}
          </Button>
        ))}

        {/* Next */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}