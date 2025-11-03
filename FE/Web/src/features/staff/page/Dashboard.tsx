import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SearchBar from "../components/SearchBar";
import ActionMenu from "../components/ActionMenu";
import EditBatteryModal from "../components/EditBatteryModal";
import Pagination from "../components/Pagination";
import { getStationBatteries, updateBattery } from "../apis/DashboardApi";
import type { Battery as OrigBattery, UpdateBatteryRequest } from "../apis/DashboardApi";
import { Spinner } from "@/components/ui/spinner";
import type { FilterValues } from "../components/FilterModal";

type Battery = OrigBattery & { status: string };

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState<Battery | null>(null);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [filteredBatteries, setFilteredBatteries] = useState<Battery[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch batteries on component mount
  useEffect(() => {
    const fetchBatteries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get staff's station from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('User information not found. Please login again.');
        }
        
        const user = JSON.parse(userStr);
        const stationId = user.station;
        
        if (!stationId) {
          throw new Error('No station assigned to this staff member.');
        }
        
        const data = await getStationBatteries(stationId);
        setBatteries(data as Battery[]);
        setFilteredBatteries(data as Battery[]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch batteries';
        setError(errorMsg);
        toast.error(errorMsg);
        console.error('Error fetching batteries:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatteries();
  }, []);

  // Derive available models from batteries
  const availableModels: string[] = Array.from(
    new Set(
      batteries
        .map(b => (b.model || '').trim())
        .filter((m): m is string => m !== '')
    )
  );

  // Filter and search batteries
  useEffect(() => {
    let filtered = [...batteries];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(battery => 
        battery.serial.toLowerCase().includes(query) ||
        battery.model?.toLowerCase().includes(query) ||
        battery.status.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.model) {
      filtered = filtered.filter(battery => battery.model === filters.model);
    }

    if (filters.status) {
      filtered = filtered.filter(battery => battery.status === filters.status);
    }

    if (filters.minSOH !== undefined && filters.maxSOH !== undefined) {
      filtered = filtered.filter(battery => 
        battery.soh >= (filters.minSOH || 0) && battery.soh <= (filters.maxSOH || 100)
      );
    } else if (filters.minSOH !== undefined) {
      filtered = filtered.filter(battery => battery.soh >= (filters.minSOH || 0));
    } else if (filters.maxSOH !== undefined) {
      filtered = filtered.filter(battery => battery.soh <= (filters.maxSOH || 100));
    }

    if (filters.minCapacity !== undefined && filters.maxCapacity !== undefined) {
      filtered = filtered.filter(battery => 
        (battery.capacity_kWh || 0) >= (filters.minCapacity || 0) && 
        (battery.capacity_kWh || 0) <= (filters.maxCapacity || 1000)
      );
    } else if (filters.minCapacity !== undefined) {
      filtered = filtered.filter(battery => (battery.capacity_kWh || 0) >= (filters.minCapacity || 0));
    } else if (filters.maxCapacity !== undefined) {
      filtered = filtered.filter(battery => (battery.capacity_kWh || 0) <= (filters.maxCapacity || 1000));
    }

    setFilteredBatteries(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [batteries, searchQuery, filters]);

  // Calculate pagination
  const totalItems = filteredBatteries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBatteries = filteredBatteries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleView = (id: string) => {
    // Navigate to Battery Log page
    navigate(`/staff/battery/${id}`);
  };

  const handleEdit = (id: string) => {
    const battery = batteries.find(b => b._id === id);
    if (battery) {
      setSelectedBattery(battery);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveBattery = async (batteryId: string, data: UpdateBatteryRequest) => {
    try {
      await updateBattery(batteryId, data);
      toast.success('Battery updated successfully!');
      
      // Refresh the battery list
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const stationId = user.station;
        if (stationId) {
          const updatedData = await getStationBatteries(stationId);
          setBatteries(updatedData as Battery[]);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update battery');
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading battery data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="inline-block w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-text-primary font-semibold mb-2">Data Loading Error</p>
          <p className="text-text-secondary">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col items-center py-8 min-h-screen">
      <div className="w-full max-w-7xl px-4">
        <div className="flex justify-between items-center mb-6">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} setFilters={setFilters} models={availableModels} />
        </div>
        <div className="overflow-x-auto">
          <div className="border border-black-500 rounded-lg shadow-xs dark:border-border dark:shadow-gray-900">
            <table className="min-w-full divide-y divide-border dark:divide-border">
              <thead className="bg-button-primary dark:bg-button-secondary">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Battery Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Model
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Capacity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Health
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-table-row divide-y divide-border dark:divide-border">
                {currentBatteries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                      No batteries in station
                    </td>
                  </tr>
                ) : (
                  currentBatteries.map((battery) => (
                    <tr key={battery._id} className="hover:bg-table-row-hover transition-colors relative">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary">{battery.serial}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary">{battery.model || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary">{battery.capacity_kWh || 0}kWh</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary">{battery.soh}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          battery.status === 'full' ? 'bg-green-100 text-green-800' :
                          battery.status === 'charging' ? 'bg-blue-100 text-blue-800' :
                          battery.status === 'faulty' ? 'bg-red-100 text-red-800' :
                          battery.status === 'in-use' ? 'bg-yellow-100 text-yellow-800' :
                          battery.status === 'idle' ? 'bg-gray-100 text-gray-800' :
                          battery.status === 'is-booking' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {battery.status === 'is-booking'
                            ? 'Is Booking'
                            : battery.status === 'in-use'
                              ? 'In Use'
                              : battery.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <ActionMenu
                          batteryId={battery._id}
                          onView={handleView}
                          onEdit={handleEdit}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>

    {/* Edit Battery Modal */}
    <EditBatteryModal
      isOpen={isEditModalOpen}
      onClose={() => {
        setIsEditModalOpen(false);
        setSelectedBattery(null);
      }}
      battery={selectedBattery}
      onSave={handleSaveBattery}
    />
    </>
  );
}
