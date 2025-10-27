import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ManagementLayout } from '../layout/ManagementLayout';
import { OverviewPage } from './OverviewPage';
import { StaffListPage } from './StaffListPage';
import { StationListPage } from './StationListPage';
import { DriverListPage } from './DriverListPage';
import { BatteryInventoryPage } from './BatteryInventoryPage';
import FaultyBatteryPage from './FaultyBatteryPage';
import { SubscriptionPage } from './SubscriptionPage';
import { TransactionPage } from './TransactionPage';
import { ComplaintManagementPage } from './ComplaintManagementPage';
import { UsageReportPage } from './UsageReportPage';
import { AIPredictionPage } from './AIPredictionPage';

export const ManagementMainPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Xác định tab hiện tại từ URL
    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes('/overview')) return 'overview';
        if (path.includes('/staff/list')) return 'staff-list';
        if (path.includes('/staff/station-list')) return 'station-list';
        if (path.includes('/driver/list')) return 'driver-list';
        if (path.includes('/battery-inventory')) return 'battery-inventory';
        if (path.includes('/faulty-batteries')) return 'faulty-batteries';
        if (path.includes('/vehicles')) return 'vehicles';
        if (path.includes('/subscriptions')) return 'subscriptions';
        if (path.includes('/transactions')) return 'transactions';
        if (path.includes('/complaints')) return 'complaints';
        if (path.includes('/usage-report')) return 'usage-report';
        if (path.includes('/ai-predictions')) return 'ai-predictions';
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
            case 'complaints':
                navigate('/complaints');
                break;
            case 'usage-report':
                navigate('/usage-report');
                break;
            case 'ai-predictions':
                navigate('/ai-predictions');
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
                return <TransactionPage />;
            case 'complaints':
                return <ComplaintManagementPage />;
            case 'usage-report':
                return <UsageReportPage />;
            case 'ai-predictions':
                return <AIPredictionPage />;
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
