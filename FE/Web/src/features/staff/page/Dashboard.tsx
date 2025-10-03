import { mockBatteries } from "../../../mock/BatteryData";
import SearchBar from "../components/SearchBar";
import ActionMenu from "../components/ActionMenu";
import { Plus } from "lucide-react";

export default function Dashboard() {
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
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="w-full max-w-8xl px-4">
        <div className="flex justify-between items-center mb-6">
          <SearchBar />
          <button
            onClick={handleAddBattery}
            className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-yellow-400 text-white hover:bg-yellow-600 active:bg-yellow-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Battery
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="border border-gray-200 rounded-lg shadow-xs overflow-hidden dark:border-neutral-700 dark:shadow-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead className="bg-black dark:bg-neutral-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-400"
                  >
                    Battery ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-400"
                  >
                    Model
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-400"
                  >
                    Capacity
                  </th>
                  <th
                    scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-400"
                  >
                    SOH
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-400"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-white uppercase dark:text-neutral-400"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {mockBatteries.map((battery) => (
                  <tr key={battery.battery_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{battery.battery_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{battery.battery_model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{battery.capacity_kWh}kWh</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{battery.soh_percent}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{battery.status}</td>
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
        </div>
      </div>
    </div>
    </>
  );
}
