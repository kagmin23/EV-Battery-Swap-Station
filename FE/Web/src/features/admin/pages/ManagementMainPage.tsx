import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ManagementLayout } from '../layout/ManagementLayout';
import { OverviewPage } from './OverviewPage';
import { StaffListPage } from './StaffListPage';
import { StaffDistributionPage } from './StaffDistributionPage';
import { StationListPage } from './StationListPage';
import { DriverListPage } from './DriverListPage';
import { BatteryInventoryPage } from './BatteryInventoryPage';
import FaultyBatteryPage from './FaultyBatteryPage';
import { SubscriptionPage } from './SubscriptionPage';

export const ManagementMainPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Xác định tab hiện tại từ URL
    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes('/overview')) return 'overview';
        if (path.includes('/staff/list')) return 'staff-list';
        if (path.includes('/staff/distribution')) return 'staff-distribution';
        if (path.includes('/staff/activities')) return 'staff-activities';
        if (path.includes('/staff/station-list')) return 'station-list';
        if (path.includes('/driver/list')) return 'driver-list';
        if (path.includes('/battery-inventory')) return 'battery-inventory';
        if (path.includes('/faulty-batteries')) return 'faulty-batteries';
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
            case 'station-list':
                navigate('/staff/station-list');
                break;
            case 'driver-list':
                navigate('/driver/list');
                break;
            case 'battery-inventory':
                navigate('/battery-inventory');
                break;
            case 'faulty-batteries':
                navigate('/faulty-batteries');
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




    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewPage />;
            case 'staff-list':
                return <StaffListPage />;
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
            case 'station-list':
                return <StationListPage />;
            case 'driver-list':
                return <DriverListPage />;
            case 'battery-inventory':
                return <BatteryInventoryPage />;
            case 'faulty-batteries':
                return <FaultyBatteryPage />;
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

        </ManagementLayout>
    );
};
