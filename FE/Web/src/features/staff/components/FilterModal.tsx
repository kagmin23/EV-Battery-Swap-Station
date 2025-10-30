import { X, Filter, RotateCcw } from "lucide-react";
import { useState } from "react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  onReset: () => void;
}

export interface FilterValues {
  model?: string;
  status?: string;
  minSOH?: number;
  maxSOH?: number;
  minCapacity?: number;
  maxCapacity?: number;
  dateFrom?: string;
  dateTo?: string;
}

const batteryModels = [
  "VinFast VF8 75kWh",
  "VinFast VF9 92kWh",
  "Tesla Model 3 60kWh",
  "Tesla Model S 100kWh",
  "BYD Blade 82kWh",
];

const statusOptions = [
  { value: "charging", label: "Charging" },
  { value: "full", label: "Full" },
  { value: "faulty", label: "Faulty" },
  { value: "in-use", label: "In Use" },
  { value: "idle", label: "Idle" },
  { value: "is-booking", label: "Is Booking" },
];

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterValues>({
    model: "",
    status: "",
    minSOH: undefined,
    maxSOH: undefined,
    minCapacity: undefined,
    maxCapacity: undefined,
    dateFrom: "",
    dateTo: "",
  });

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      model: "",
      status: "",
      minSOH: undefined,
      maxSOH: undefined,
      minCapacity: undefined,
      maxCapacity: undefined,
      dateFrom: "",
      dateTo: "",
    });
    onReset();
  };

  const updateFilter = (key: keyof FilterValues, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
                <p className="text-sm text-gray-600">Customize search criteria</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Model Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Battery Model
              </label>
              <select
                value={filters.model}
                onChange={(e) => updateFilter("model", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">All Models</option>
                {batteryModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* SOH Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State of Health (SOH)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.minSOH || ""}
                    onChange={(e) => updateFilter("minSOH", Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.maxSOH || ""}
                    onChange={(e) => updateFilter("maxSOH", Number(e.target.value))}
                    placeholder="100"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Capacity Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Capacity (kWh)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From (kWh)</label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minCapacity || ""}
                    onChange={(e) => updateFilter("minCapacity", Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To (kWh)</label>
                  <input
                    type="number"
                    min="0"
                    value={filters.maxCapacity || ""}
                    onChange={(e) => updateFilter("maxCapacity", Number(e.target.value))}
                    placeholder="150"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter("dateFrom", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter("dateTo", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
