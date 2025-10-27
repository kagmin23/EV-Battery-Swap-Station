import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ManagementLayout } from '../layout/ManagementLayout';
import { StaffOverviewPage } from './StaffOverviewPage';
import { StaffListPage } from './StaffListPage';
import { StationListPage } from './StationListPage';
import { StaffDetailModal } from '../components/StaffDetailModal';
import type { Staff } from '../types/staff';

export const StaffManagementMainPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Xác định tab hiện tại từ URL
    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes('/staff/overview')) return 'overview';
        if (path.includes('/staff/list')) return 'staff-list';
        if (path.includes('/staff/settings')) return 'settings';
        if (path.includes('/staff/station-list')) return 'station-list';
        if (path.includes('/admin/dashboard')) return 'dashboard';
        if (path.includes('/admin/battery-changes')) return 'battery-changes';
        if (path.includes('/admin/ai-forecast')) return 'ai-forecast';
        if (path.includes('/admin/report-management')) return 'report-management';
        if (path.includes('/admin/revenue-report')) return 'revenue-report';
        return 'overview';
    };

    const [activeTab, setActiveTab] = useState(() => getCurrentTab());

    // Cập nhật tab khi URL thay đổi
    useEffect(() => {
        const path = location.pathname;
        let newTab = 'overview';
        if (path.includes('/staff/overview')) newTab = 'overview';
        else if (path.includes('/staff/list')) newTab = 'staff-list';
        else if (path.includes('/staff/distribution')) newTab = 'staff-distribution';
        else if (path.includes('/staff/activities')) newTab = 'staff-activities';
        else if (path.includes('/staff/settings')) newTab = 'settings';
        else if (path.includes('/staff/station-list')) newTab = 'station-list';
        else if (path.includes('/admin/dashboard')) newTab = 'dashboard';
        else if (path.includes('/admin/battery-changes')) newTab = 'battery-changes';
        else if (path.includes('/admin/ai-forecast')) newTab = 'ai-forecast';
        else if (path.includes('/admin/report-management')) newTab = 'report-management';
        else if (path.includes('/admin/revenue-report')) newTab = 'revenue-report';
        
        setActiveTab(newTab);
    }, [location.pathname]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        // Navigate to corresponding URL
        switch (tab) {
            case 'overview':
                navigate('/staff/overview');
                break;
            case 'dashboard':
                navigate('/admin/dashboard');
                break;
            case 'battery-changes':
                navigate('/admin/battery-changes');
                break;
            case 'ai-forecast':
                navigate('/admin/ai-forecast');
                break;
            case 'report-management':
                navigate('/admin/report-management');
                break;
            case 'revenue-report':
                navigate('/admin/revenue-report');
                break;
            case 'staff-list':
                navigate('/staff/list');
                break;
            case 'station-list':
                navigate('/staff/station-list');
                break;
            case 'settings':
                navigate('/staff/settings');
                break;
            default:
                navigate('/staff/overview');
        }
    };

    const handleStaffSelect = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsDetailModalOpen(true);
    };


    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview':
                return <StaffOverviewPage />;
            case 'staff-list':
                return <StaffListPage onStaffSelect={handleStaffSelect} />;
            case 'station-list':
                return <StationListPage />;
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
                return <StaffOverviewPage />;
        }
    };

    return (
        <ManagementLayout activeTab={activeTab} onTabChange={handleTabChange}>
            {renderActiveTab()}

            {/* Staff Detail Modal */}
            <StaffDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedStaff(null);
                }}
                staff={selectedStaff}
            />
        </ManagementLayout>
    );
};
