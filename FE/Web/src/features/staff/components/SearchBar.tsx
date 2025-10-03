import { Search, SlidersHorizontal } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex gap-3 items-center flex-1">
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 dark:text-neutral-500" />
        </div>
        <input
          type="text"
          className="py-3 px-4 pl-11 block w-full border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:placeholder-neutral-400 dark:focus:ring-blue-600"
          placeholder="Search batteries by ID, model, or status..."
        />
      </div>
      <button
        type="button"
        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-black text-white hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-gray-900 dark:focus:bg-gray-900">
        Filter
        <SlidersHorizontal className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
