import { useState, type Dispatch, type SetStateAction } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FilterModal from './FilterModal';
import type { FilterValues } from './FilterModal';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setFilters: Dispatch<SetStateAction<FilterValues>>;
  models: string[];
}

export default function SearchBar({ searchQuery, setSearchQuery, setFilters, models }: SearchBarProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <>
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        models={models}
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            className="h-12 w-full rounded-xl border-slate-200 bg-white/80 pl-10 text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Search batteries by ID, model, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          type="button"
          size="lg"
          className="h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 font-semibold text-white shadow-lg shadow-indigo-200 hover:from-indigo-600 hover:to-violet-600"
          onClick={() => setIsFilterModalOpen(true)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
    </>
  );
}
