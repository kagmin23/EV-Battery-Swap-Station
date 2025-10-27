// Preline Skeleton Components using Tailwind CSS animate-pulse

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ rows = 5, columns = 5, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {showHeader && (
        <div className="animate-pulse flex gap-4 mb-4 pb-4 border-b border-gray-200">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700" />
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="animate-pulse flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1">
                <div className="h-8 bg-gray-200 rounded dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-gray-200 rounded-full dark:bg-gray-700" />
              <div className="h-10 w-10 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded dark:bg-gray-700 mb-2" />
            <div className="h-3 w-32 bg-gray-200 rounded-full dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

