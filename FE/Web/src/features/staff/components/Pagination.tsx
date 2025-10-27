import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    // Validate totalPages
    if (!totalPages || totalPages < 1 || isNaN(totalPages)) {
      return [1];
    }

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          if (i > 0) pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    // Filter out any invalid values
    return pages.filter(p => p === "..." || (typeof p === "number" && !isNaN(p) && p > 0));
  };

  const startItem = totalItems ? (currentPage - 1) * (itemsPerPage || 10) + 1 : 0;
  const endItem = totalItems
    ? Math.min(currentPage * (itemsPerPage || 10), totalItems)
    : 0;

  return (
    <div className="flex flex-col items-center py-4 gap-3">
      {/* Pagination */}
      <nav className="flex items-center -space-x-px" aria-label="Pagination">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-s-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:block">Trước</span>
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <div
                key={`ellipsis-${index}`}
                className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm"
              >
                ...
              </div>
            );
          }

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page as number)}
              className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
              }`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-e-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          aria-label="Next"
        >
          <span className="hidden sm:block">Tiếp theo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Items info */}
      {totalItems && (
        <div className="text-sm text-gray-800">
          Hiển thị <span className="font-semibold text-text-primary">{startItem}</span> đến{" "}
          <span className="font-semibold text-text-primary">{endItem}</span> trên{" "}
          <span className="font-semibold text-text-primary">{totalItems}</span> kết quả
        </div>
      )}
    </div>
  );
}
