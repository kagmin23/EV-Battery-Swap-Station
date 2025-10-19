import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SearchBar from "../components/SearchBar";
import ActionMenu from "../components/ActionMenu";
import TransferBatteryModal from "../components/TransferBatteryModal";
import EditBatteryModal from "../components/EditBatteryModal";
import { Plus, ArrowRightLeft } from "lucide-react";
import Pagination from "../components/Pagination";
import { getStationBatteries, updateBattery } from "../apis/DashboardApi";
import type { Battery, UpdateBatteryRequest } from "../apis/DashboardApi";
import { TableSkeleton, CardSkeleton } from "@/components/ui/table-skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState<Battery | null>(null);
  const [batteries, setBatteries] = useState<Battery[]>([]);
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
        setBatteries(data);
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

  // Calculate pagination
  const totalItems = batteries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBatteries = batteries.slice(startIndex, endIndex);

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
      toast.success('Cập nhật pin thành công!');
      
      // Refresh the battery list
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const stationId = user.station;
        if (stationId) {
          const updatedData = await getStationBatteries(stationId);
          setBatteries(updatedData);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật pin');
      throw error;
    }
  };

  const handleAddBattery = () => {
    console.log("Add new battery");
  };

  if (isLoading) {
    return (
      <div className="p-8">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded dark:bg-gray-700 mb-2" />
          <div className="h-4 w-48 bg-gray-200 rounded-full dark:bg-gray-700" />
        </div>
        
        {/* Stats Cards Skeleton */}
        <CardSkeleton count={4} />
        
        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700" />
          </div>
          <TableSkeleton rows={8} columns={6} />
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
          <p className="text-text-primary font-semibold mb-2">Lỗi tải dữ liệu</p>
          <p className="text-text-secondary">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
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
          <SearchBar />
          <div className="flex gap-3">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:active:bg-blue-800"
            >
              <ArrowRightLeft className="w-5 h-5" />
              Chuyển đến Trạm
            </button>
            <button
              onClick={handleAddBattery}
              className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-button-secondary text-text-primary hover:bg-button-secondary-hover active:bg-button-secondary-hover disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-button-secondary-hover dark:focus:bg-button-secondary-hover"
            >
              <Plus className="w-5 h-5" />
              Thêm Pin
            </button>
          </div>
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
                    Mã Pin
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Mẫu
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Dung lượng
                  </th>
                  <th
                    scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Tình trạng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-table-row divide-y divide-border dark:divide-border">
                {currentBatteries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                      Không có pin nào trong trạm
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
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {battery.status}
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

    {/* Transfer Battery Modal */}
    <TransferBatteryModal
      isOpen={isTransferModalOpen}
      onClose={() => setIsTransferModalOpen(false)}
      batteries={batteries}
      currentStation={JSON.parse(localStorage.getItem('user') || '{}').station || ''}
    />

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
