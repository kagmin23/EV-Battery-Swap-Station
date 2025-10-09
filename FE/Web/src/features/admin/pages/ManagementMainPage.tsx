import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ManagementLayout } from '../layout/ManagementLayout';
import { OverviewPage } from './OverviewPage';
import { StaffListPage } from './StaffListPage';
import { StaffDistributionPage } from './StaffDistributionPage';
import { DriverListPage } from './DriverListPage';
import { BatteryInventoryPage } from './BatteryInventoryPage';
import { SubscriptionPage } from './SubscriptionPage';
import type { Staff } from '../types/staff';
import type { Driver as DriverType } from '../types/driver';
import type { Battery } from '../types/battery';

export const ManagementMainPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<DriverType | null>(null);
    const [selectedBattery, setSelectedBattery] = useState<Battery | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Xác định tab hiện tại từ URL
    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes('/overview')) return 'overview';
        if (path.includes('/staff/list')) return 'staff-list';
        if (path.includes('/staff/distribution')) return 'staff-distribution';
        if (path.includes('/staff/activities')) return 'staff-activities';
        if (path.includes('/driver/list')) return 'driver-list';
        if (path.includes('/battery-inventory')) return 'battery-inventory';
        if (path.includes('/vehicles')) return 'vehicles';
        if (path.includes('/subscriptions')) return 'subscriptions';
        if (path.includes('/transactions')) return 'transactions';
        if (path.includes('/settings')) return 'settings';
        return 'overview';
    };

    const [activeTab, setActiveTab] = useState(getCurrentTab());

    // Cập nhật tab khi URL thay đổi
    useEffect(() => {
        setActiveTab(getCurrentTab());
    }, [location.pathname]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        // Navigate to corresponding URL
        switch (tab) {
            case 'overview':
                navigate('/overview');
                break;
            case 'staff-list':
                navigate('/staff/list');
                break;
            case 'staff-distribution':
                navigate('/staff/distribution');
                break;
            case 'staff-activities':
                navigate('/staff/activities');
                break;
            case 'driver-list':
                navigate('/driver/list');
                break;
            case 'battery-inventory':
                navigate('/battery-inventory');
                break;
            case 'vehicles':
                navigate('/vehicles');
                break;
            case 'subscriptions':
                navigate('/subscriptions');
                break;
            case 'transactions':
                navigate('/transactions');
                break;
            case 'settings':
                navigate('/settings');
                break;
            default:
                navigate('/overview');
        }
    };

    const handleStaffSelect = (staff: Staff) => {
        setSelectedStaff(staff);
        setSelectedDriver(null);
        setSelectedBattery(null);
        setIsDetailModalOpen(true);
    };

    const handleDriverSelect = (driver: DriverType) => {
        setSelectedDriver(driver);
        setSelectedStaff(null);
        setSelectedBattery(null);
        setIsDetailModalOpen(true);
    };

    const handleBatterySelect = (battery: Battery) => {
        setSelectedBattery(battery);
        setSelectedStaff(null);
        setSelectedDriver(null);
        setIsDetailModalOpen(true);
    };

    const handleStaffEdit = (staff: Staff) => {
        // TODO: Implement edit functionality
        console.log('Edit staff:', staff);
    };

    const handleDriverEdit = (driver: DriverType) => {
        // TODO: Implement edit functionality
        console.log('Edit driver:', driver);
    };

    const handleBatteryEdit = (battery: Battery) => {
        // TODO: Implement edit functionality
        console.log('Edit battery:', battery);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewPage />;
            case 'staff-list':
                return <StaffListPage onStaffSelect={handleStaffSelect} />;
            case 'staff-distribution':
                return <StaffDistributionPage />;
            case 'staff-activities':
                return (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Hoạt động nhân viên</h2>
                            <p className="text-slate-600">Tính năng đang được phát triển</p>
                        </div>
                    </div>
                );
            case 'driver-list':
                return <DriverListPage onDriverSelect={handleDriverSelect} />;
            case 'battery-inventory':
                return <BatteryInventoryPage onBatterySelect={handleBatterySelect} />;
            case 'vehicles':
                return (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Quản lý phương tiện</h2>
                            <p className="text-slate-600">Tính năng đang được phát triển</p>
                        </div>
                    </div>
                );
            case 'subscriptions':
                return <SubscriptionPage />;
            case 'transactions':
                return (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Lịch sử giao dịch</h2>
                            <p className="text-slate-600">Tính năng đang được phát triển</p>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Cài đặt</h2>
                            <p className="text-slate-600">Tính năng đang được phát triển</p>
                        </div>
                    </div>
                );
            default:
                return <OverviewPage />;
        }
    };

    return (
        <ManagementLayout activeTab={activeTab} onTabChange={handleTabChange}>
            {renderActiveTab()}

            {/* Detail Modal - TODO: Implement */}
            {isDetailModalOpen && (selectedStaff || selectedDriver || selectedBattery) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {selectedStaff ? 'Chi tiết nhân viên' :
                                selectedDriver ? 'Chi tiết tài xế' :
                                    'Chi tiết pin'}
                        </h3>
                        <div className="space-y-2">
                            {selectedStaff ? (
                                <>
                                    <p><strong>Tên:</strong> {selectedStaff.name}</p>
                                    <p><strong>Email:</strong> {selectedStaff.email}</p>
                                    <p><strong>Vai trò:</strong> {selectedStaff.role}</p>
                                    <p><strong>Trạm:</strong> {selectedStaff.stationName}</p>
                                </>
                            ) : selectedDriver ? (
                                <>
                                    <p><strong>Tên:</strong> {selectedDriver.name}</p>
                                    <p><strong>Email:</strong> {selectedDriver.email}</p>
                                    <p><strong>Bằng lái:</strong> {selectedDriver.licenseNumber}</p>
                                    <p><strong>Xe:</strong> {selectedDriver.vehicleModel}</p>
                                </>
                            ) : selectedBattery ? (
                                <>
                                    <p><strong>Số seri:</strong> {selectedBattery.serialNumber}</p>
                                    <p><strong>Model:</strong> {selectedBattery.model}</p>
                                    <p><strong>Nhà SX:</strong> {selectedBattery.manufacturer}</p>
                                    <p><strong>Dung lượng:</strong> {selectedBattery.capacity} kWh</p>
                                    <p><strong>Sạc hiện tại:</strong> {selectedBattery.currentCharge}%</p>
                                    <p><strong>Sức khỏe:</strong> {selectedBattery.health}%</p>
                                </>
                            ) : null}
                        </div>
                        <div className="flex space-x-2 mt-6">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedStaff) handleStaffEdit(selectedStaff);
                                    if (selectedDriver) handleDriverEdit(selectedDriver);
                                    if (selectedBattery) handleBatteryEdit(selectedBattery);
                                    setIsDetailModalOpen(false);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ManagementLayout>
    );
};
