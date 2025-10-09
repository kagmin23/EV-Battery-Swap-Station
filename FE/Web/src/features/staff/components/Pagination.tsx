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
          className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-s-lg border border-button-primary text-text-primary hover:bg-button-hover focus:outline-none focus:bg-button-hover disabled:opacity-50 disabled:pointer-events-none dark:bg-button-secondary dark:border-button-secondary dark:text-white dark:hover:bg-button-secondary-hover dark:focus:bg-button-secondary-hover"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:block">Previous</span>
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <div
                key={`ellipsis-${index}`}
                className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-200 text-text-primary py-2 px-3 text-sm dark:border-neutral-700 dark:text-white"
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
              className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none ${
                currentPage === page
                  ? "bg-button-primary text-text-primary border-button-primary hover:bg-button-hover dark:bg-button-secondary dark:border-button-secondary"
                  : "border-button-primary text-text-primary hover:bg-button-hover dark:bg-button-secondary dark:border-button-secondary"
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
          className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-e-lg border border-button-primary text-text-primary hover:bg-button-hover focus:outline-none focus:bg-button-hover disabled:opacity-50 disabled:pointer-events-none dark:bg-button-secondary dark:border-button-secondary dark:text-white dark:hover:bg-button-secondary-hover dark:focus:bg-button-secondary-hover"
          aria-label="Next"
        >
          <span className="hidden sm:block">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Items info */}
      {totalItems && (
        <div className="text-sm text-text-primary">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}
    </div>
  );
}
