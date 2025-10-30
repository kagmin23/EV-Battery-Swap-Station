import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import FilterModal from "./FilterModal";
import type { FilterValues } from "./FilterModal";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: FilterValues) => void;
}

export default function SearchBar({ searchQuery, setSearchQuery, setFilters }: SearchBarProps) {
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
    />
    <div className="flex gap-3 items-center flex-1">
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-text-primary " />
        </div>
        <input
          type="text"
          className="py-3 px-4 pl-11 block w-full border border-black-500 rounded-lg text-sm text-text-primary"
          placeholder="Search batteries by ID, model, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-button-secondary text-text-primary hover:bg-button-secondary-hover active:bg-button-secondary-hover disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-button-secondary-hover dark:focus:bg-button-secondary-hover"
        onClick={() => setIsFilterModalOpen(true)}
      >
        Filter
        <SlidersHorizontal className="w-5 h-5 text-text-primary" />
      </button>
    </div>
    </>
  );
}
