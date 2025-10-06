import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Grid, List, Users, Clock, Activity } from 'lucide-react';
import { StaffSearchBar } from '../components/StaffSearchBar';
import { StaffCard } from '../components/StaffCard';
import { StaffTable } from '../components/StaffTable';
import { StaffModal } from '../components/StaffModal';
import type { Staff, StaffFilters, AddStaffRequest, UpdateStaffRequest, StaffPermission, Station } from '../types/staff';

// Mock data - trong thực tế sẽ lấy từ API
const mockStations: Station[] = [
    { id: '1', name: 'Trạm Hà Nội', address: '123 Đường ABC, Hà Nội', city: 'Hà Nội', coordinates: { lat: 21.0285, lng: 105.8542 }, totalSlots: 20, availableSlots: 15, status: 'ACTIVE' },
    { id: '2', name: 'Trạm TP.HCM', address: '456 Đường XYZ, TP.HCM', city: 'TP.HCM', coordinates: { lat: 10.8231, lng: 106.6297 }, totalSlots: 30, availableSlots: 25, status: 'ACTIVE' },
    { id: '3', name: 'Trạm Đà Nẵng', address: '789 Đường DEF, Đà Nẵng', city: 'Đà Nẵng', coordinates: { lat: 16.0544, lng: 108.2022 }, totalSlots: 15, availableSlots: 12, status: 'ACTIVE' },
];

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

const mockPermissions: StaffPermission[] = [
    { id: '1', name: 'Quản lý nhân viên', description: 'Có thể thêm, sửa, xóa nhân viên', enabled: false },
    { id: '2', name: 'Xem báo cáo', description: 'Có thể xem các báo cáo thống kê', enabled: false },
    { id: '3', name: 'Quản lý trạm', description: 'Có thể quản lý thông tin trạm', enabled: false },
    { id: '4', name: 'Xử lý thanh toán', description: 'Có thể xử lý các giao dịch thanh toán', enabled: false },
    { id: '5', name: 'Quản lý pin', description: 'Có thể quản lý tồn kho pin', enabled: false },
];

interface StaffListPageProps {
    onStaffSelect?: (staff: Staff) => void;
}

export const StaffListPage: React.FC<StaffListPageProps> = ({ onStaffSelect }) => {
    const [staff, setStaff] = useState<Staff[]>(mockStaff);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [filters, setFilters] = useState<StaffFilters>({
        search: '',
        stationId: 'ALL',
        role: 'ALL',
        status: 'ALL',
    });

    const filteredStaff = staff.filter((staffMember) => {
        const matchesSearch = filters.search === '' ||
            staffMember.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            staffMember.email.toLowerCase().includes(filters.search.toLowerCase());

        const matchesStation = filters.stationId === 'ALL' || staffMember.stationId === filters.stationId;
        const matchesRole = filters.role === 'ALL' || staffMember.role === filters.role;
        const matchesStatus = filters.status === 'ALL' || staffMember.status === filters.status;

        return matchesSearch && matchesStation && matchesRole && matchesStatus;
    });

    const handleStaffEdit = (staffMember: Staff) => {
        setEditingStaff(staffMember);
        setIsModalOpen(true);
    };

    const handleStaffSuspend = (staffMember: Staff) => {
        if (window.confirm(`Bạn có chắc chắn muốn tạm khóa nhân viên ${staffMember.name}?`)) {
            setStaff(prev => prev.map(s =>
                s.id === staffMember.id
                    ? { ...s, status: 'SUSPENDED' as const, updatedAt: new Date() }
                    : s
            ));
        }
    };

    const handleAddStaff = () => {
        setEditingStaff(null);
        setIsModalOpen(true);
    };

    const handleSaveStaff = (data: AddStaffRequest | UpdateStaffRequest) => {
        if ('id' in data) {
            // Update existing staff
            setStaff(prev => prev.map(s =>
                s.id === data.id
                    ? {
                        ...s,
                        ...data,
                        permissions: mockPermissions.filter(p => data.permissions?.includes(p.id)),
                        updatedAt: new Date()
                    }
                    : s
            ));
        } else {
            // Add new staff
            const newStaff: Staff = {
                id: Date.now().toString(),
                ...data,
                stationName: mockStations.find(s => s.id === data.stationId)?.name || '',
                status: 'OFFLINE',
                permissions: mockPermissions.filter(p => data.permissions?.includes(p.id)),
                lastActive: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setStaff(prev => [...prev, newStaff]);
        }
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                        Danh sách nhân viên
                    </h1>
                    <p className="text-slate-600 font-medium">Quản lý thông tin nhân viên trạm đổi pin</p>
                </div>
                <Button
                    onClick={handleAddStaff}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Thêm nhân viên
                </Button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200/50 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-500 rounded-xl">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-blue-900">{mockStaff.length}</div>
                                <div className="text-lg text-blue-700 font-medium">Tổng nhân viên</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100/50 border-green-200/50 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-500 rounded-xl">
                                <Clock className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-green-900">
                                    {mockStaff.filter(s => s.status === 'ONLINE').length}
                                </div>
                                <div className="text-lg text-green-700 font-medium">Đang online</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100/50 border-orange-200/50 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-orange-500 rounded-xl">
                                <Activity className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-orange-900">
                                    {mockStaff.filter(s => s.status === 'SHIFT_ACTIVE').length}
                                </div>
                                <div className="text-lg text-orange-700 font-medium">Đang ca làm</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <StaffSearchBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    stations={mockStations}
                />
            </div>

            {/* Staff List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                            <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            Danh sách nhân viên
                            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                {filteredStaff.length}
                            </span>
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg transition-all duration-200 ${viewMode === 'grid'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                                    : 'hover:bg-slate-100'
                                    }`}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={`rounded-lg transition-all duration-200 ${viewMode === 'table'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                                    : 'hover:bg-slate-100'
                                    }`}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStaff.map((staffMember) => (
                                <StaffCard
                                    key={staffMember.id}
                                    staff={staffMember}
                                    onSelect={onStaffSelect || (() => { })}
                                    onEdit={handleStaffEdit}
                                    onSuspend={handleStaffSuspend}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <StaffTable
                                staff={filteredStaff}
                                onSelect={onStaffSelect || (() => { })}
                                onEdit={handleStaffEdit}
                                onSuspend={handleStaffSuspend}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Staff Modal */}
            <StaffModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingStaff(null);
                }}
                onSave={handleSaveStaff}
                staff={editingStaff}
                stations={mockStations}
                permissions={mockPermissions}
            />
        </div>
    );
};
