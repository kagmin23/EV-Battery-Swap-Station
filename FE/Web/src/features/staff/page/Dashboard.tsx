import { useState } from "react";
import { mockBatteries } from "../../../mock/BatteryData";
import SearchBar from "../components/SearchBar";
import ActionMenu from "../components/ActionMenu";
import { Plus } from "lucide-react";
import Pagination from "../components/Pagination";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalItems = mockBatteries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBatteries = mockBatteries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (id: string) => {
    console.log("Edit battery:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete battery:", id);
  };

  const handleView = (id: string) => {
    console.log("View battery:", id);
  };

  const handleAddBattery = () => {
    console.log("Add new battery");
  };

  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen py-8 ">
      <div className="w-full max-w-7xl px-4">
        <div className="flex justify-between items-center mb-6">
          <SearchBar />
          <button
            onClick={handleAddBattery}
            className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-button-primary text-white hover:bg-button-hover active:bg-button-secondary dark:bg-button-secondary dark:hover:bg-button-secondary-hover dark:active:bg-button-secondary-hover"
          >
            <Plus className="w-5 h-5" />
            Add Battery
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="border border-border rounded-lg shadow-xs overflow-hidden dark:border-border dark:shadow-gray-900">
            <table className="min-w-full divide-y divide-border dark:divide-border">
              <thead className="bg-button-primary dark:bg-button-secondary">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase dark:text-text-primary"
                  >
                    Battery ID
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
                    SOH
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
                {currentBatteries.map((battery) => (
                  <tr key={battery.battery_id} className="hover:bg-table-row-hover transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary">{battery.battery_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary">{battery.battery_model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary">{battery.capacity_kWh}kWh</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary">{battery.soh_percent}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-secondary">{battery.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <ActionMenu
                        batteryId={battery.battery_id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                      />
                    </td>
                  </tr>
                ))}
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
    </>
  );
}
