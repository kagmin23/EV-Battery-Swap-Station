import React, { useState } from 'react';
import { StaffLayout } from '../layout/StaffLayout';
import { StaffOverviewPage } from './StaffOverviewPage';
import { StaffListPage } from './StaffListPage';
import { StaffDistributionPage } from './StaffDistributionPage';
import { StaffDetailModal } from '../components/StaffDetailModal';
import type { Staff, StaffActivity, StaffPermission } from '../types/staff';

// Mock data
const mockStaff: Staff[] = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0123456789',
        role: 'MANAGER',
        stationId: '1',
        stationName: 'Trạm Hà Nội',
        status: 'ONLINE',
        permissions: [
            { id: '1', name: 'Quản lý nhân viên', description: 'Có thể thêm, sửa, xóa nhân viên', enabled: true },
            { id: '2', name: 'Xem báo cáo', description: 'Có thể xem các báo cáo thống kê', enabled: true },
            { id: '3', name: 'Quản lý trạm', description: 'Có thể quản lý thông tin trạm', enabled: true },
        ],
        lastActive: new Date(Date.now() - 5 * 60 * 1000),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0987654321',
        role: 'SUPERVISOR',
        stationId: '1',
        stationName: 'Trạm Hà Nội',
        status: 'SHIFT_ACTIVE',
        permissions: [
            { id: '1', name: 'Quản lý nhân viên', description: 'Có thể thêm, sửa, xóa nhân viên', enabled: false },
            { id: '2', name: 'Xem báo cáo', description: 'Có thể xem các báo cáo thống kê', enabled: true },
            { id: '3', name: 'Quản lý trạm', description: 'Có thể quản lý thông tin trạm', enabled: false },
        ],
        lastActive: new Date(Date.now() - 2 * 60 * 1000),
        shiftStart: new Date(Date.now() - 8 * 60 * 60 * 1000),
        shiftEnd: new Date(Date.now() + 4 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10'),
    },
    {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0369258147',
        role: 'STAFF',
        stationId: '2',
        stationName: 'Trạm TP.HCM',
        status: 'OFFLINE',
        permissions: [
            { id: '1', name: 'Quản lý nhân viên', description: 'Có thể thêm, sửa, xóa nhân viên', enabled: false },
            { id: '2', name: 'Xem báo cáo', description: 'Có thể xem các báo cáo thống kê', enabled: false },
            { id: '3', name: 'Quản lý trạm', description: 'Có thể quản lý thông tin trạm', enabled: false },
        ],
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12'),
    },
];

const mockActivities: StaffActivity[] = [
    {
        id: '1',
        staffId: '1',
        type: 'BATTERY_SWAP',
        description: 'Thực hiện đổi pin cho xe ABC-123',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        stationId: '1',
        customerId: 'customer-1',
        batteryId: 'battery-1',
    },
    {
        id: '2',
        staffId: '2',
        type: 'PAYMENT',
        description: 'Xử lý thanh toán cho giao dịch #12345',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        stationId: '1',
        customerId: 'customer-2',
    },
    {
        id: '3',
        staffId: '1',
        type: 'LOGIN',
        description: 'Đăng nhập vào hệ thống',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        stationId: '1',
    },
];

export const StaffManagementMainPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const handleStaffSelect = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsDetailModalOpen(true);
    };

    const handleStaffEdit = (staff: Staff) => {
        // TODO: Implement edit functionality
        console.log('Edit staff:', staff);
    };

    const handleResetPassword = (staff: Staff) => {
        if (window.confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu cho ${staff.name}?`)) {
            // TODO: Implement reset password API call
            alert('Mật khẩu đã được đặt lại và gửi qua email');
        }
    };

    const handleStaffSuspend = (staff: Staff) => {
        if (window.confirm(`Bạn có chắc chắn muốn tạm khóa nhân viên ${staff.name}?`)) {
            // TODO: Implement suspend API call
            alert('Nhân viên đã được tạm khóa');
        }
    };

    const handlePermissionChange = (staffId: string, permissionId: string, enabled: boolean) => {
        // TODO: Implement permission change API call
        console.log('Permission change:', { staffId, permissionId, enabled });
    };

    const selectedStaffActivities = selectedStaff
        ? mockActivities.filter(activity => activity.staffId === selectedStaff.id)
        : [];

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview':
                return <StaffOverviewPage />;
            case 'staff-list':
                return <StaffListPage onStaffSelect={handleStaffSelect} />;
            case 'staff-distribution':
                return <StaffDistributionPage />;
            case 'staff-activities':
                return (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Trang hoạt động</h2>
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
                return <StaffOverviewPage />;
        }
    };

    return (
        <StaffLayout activeTab={activeTab} onTabChange={handleTabChange}>
            {renderActiveTab()}

            {/* Staff Detail Modal */}
            <StaffDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedStaff(null);
                }}
                staff={selectedStaff}
                activities={selectedStaffActivities}
                onEdit={handleStaffEdit}
                onResetPassword={handleResetPassword}
                onSuspend={handleStaffSuspend}
                onPermissionChange={handlePermissionChange}
            />
        </StaffLayout>
    );
};
