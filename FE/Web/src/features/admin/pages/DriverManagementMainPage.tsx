import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DriverLayout } from '../layout/DriverLayout';
import { DriverOverviewPage } from './DriverOverviewPage';
import { DriverListPage } from './DriverListPage';
import type { Driver } from '../types/driver';

export const DriverManagementMainPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Xác định tab hiện tại từ URL
    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes('/driver/overview')) return 'overview';
        if (path.includes('/driver/list')) return 'driver-list';
        if (path.includes('/driver/vehicles')) return 'vehicles';
        if (path.includes('/driver/subscriptions')) return 'subscriptions';
        if (path.includes('/driver/transactions')) return 'transactions';
        if (path.includes('/driver/support')) return 'support';
        if (path.includes('/driver/settings')) return 'settings';
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
                navigate('/driver/overview');
                break;
            case 'driver-list':
                navigate('/driver/list');
                break;
            case 'vehicles':
                navigate('/driver/vehicles');
                break;
            case 'subscriptions':
                navigate('/driver/subscriptions');
                break;
            case 'transactions':
                navigate('/driver/transactions');
                break;
            case 'support':
                navigate('/driver/support');
                break;
            case 'settings':
                navigate('/driver/settings');
                break;
            default:
                navigate('/driver/overview');
        }
    };

    const handleDriverSelect = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsDetailModalOpen(true);
    };

    const handleDriverEdit = (driver: Driver) => {
        // TODO: Implement edit functionality
        console.log('Edit driver:', driver);
    };

    // const handleDriverSuspend = (driver: Driver) => {
    //     if (window.confirm(`Bạn có chắc chắn muốn tạm khóa tài xế ${driver.name}?`)) {
    //         // TODO: Implement suspend API call
    //         alert('Tài xế đã được tạm khóa');
    //     }
    // };

    // const handleDriverActivate = (driver: Driver) => {
    //     if (window.confirm(`Bạn có chắc chắn muốn kích hoạt tài xế ${driver.name}?`)) {
    //         // TODO: Implement activate API call
    //         alert('Tài xế đã được kích hoạt');
    //     }
    // };

    // const handleSubscriptionChange = (driverId: string, subscriptionPlanId: string) => {
    //     // TODO: Implement subscription change API call
    //     console.log('Subscription change:', { driverId, subscriptionPlanId });
    // };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview':
                return <DriverOverviewPage />;
            case 'driver-list':
                return <DriverListPage onDriverSelect={handleDriverSelect} />;
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
                return (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Quản lý gói thuê</h2>
                            <p className="text-slate-600">Tính năng đang được phát triển</p>
                        </div>
                    </div>
                );
            case 'transactions':
                return (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Lịch sử giao dịch</h2>
                            <p className="text-slate-600">Tính năng đang được phát triển</p>
                        </div>
                    </div>
                );
            case 'support':
                return (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Hỗ trợ khách hàng</h2>
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
                return <DriverOverviewPage />;
        }
    };

    return (
        <DriverLayout activeTab={activeTab} onTabChange={handleTabChange}>
            {renderActiveTab()}

            {/* Driver Detail Modal - TODO: Implement */}
            {isDetailModalOpen && selectedDriver && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Chi tiết tài xế</h3>
                        <div className="space-y-2">
                            <p><strong>Tên:</strong> {selectedDriver.name}</p>
                            <p><strong>Email:</strong> {selectedDriver.email}</p>
                            <p><strong>Bằng lái:</strong> {selectedDriver.licenseNumber}</p>
                            <p><strong>Xe:</strong> {selectedDriver.vehicleModel}</p>
                            <p><strong>Gói thuê:</strong> {selectedDriver.subscriptionPlan.name}</p>
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
                                    handleDriverEdit(selectedDriver);
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
        </DriverLayout>
    );
};
