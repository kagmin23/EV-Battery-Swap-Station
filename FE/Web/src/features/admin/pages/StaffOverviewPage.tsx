import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { StaffStatsWidget } from '../components/StaffStatsWidget';
import { StaffShiftCoverage } from '../components/StaffShiftCoverage';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { Activity, TrendingUp, Users, Clock } from 'lucide-react';
import type { Staff, StaffStats, StaffActivity } from '../types/staff';

// Mock data - trong thực tế sẽ lấy từ API
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
    permissions: [],
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
    permissions: [],
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
    permissions: [],
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

const mockStats: StaffStats = {
  totalStaff: mockStaff.length,
  onlineStaff: mockStaff.filter(s => s.status === 'ONLINE').length,
  shiftActiveStaff: mockStaff.filter(s => s.status === 'SHIFT_ACTIVE').length,
  suspendedStaff: mockStaff.filter(s => s.status === 'SUSPENDED').length,
  staffByStation: [
    { stationId: '1', stationName: 'Trạm Hà Nội', count: 2 },
    { stationId: '2', stationName: 'Trạm TP.HCM', count: 1 },
    { stationId: '3', stationName: 'Trạm Đà Nẵng', count: 0 },
  ],
  recentActivities: mockActivities,
};

export const StaffOverviewPage: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <PageHeader
        title="Tổng quan nhân viên"
        description="Thống kê và theo dõi hoạt động nhân viên"
      />

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Tổng nhân viên"
          value={mockStats.totalStaff}
          icon={Users}
          gradientFrom="from-blue-50"
          gradientTo="to-blue-100/50"
          textColor="text-blue-900"
          iconBg="bg-blue-500"
        />
        <StatsCard
          title="Đang online"
          value={mockStats.onlineStaff}
          icon={Clock}
          gradientFrom="from-green-50"
          gradientTo="to-green-100/50"
          textColor="text-green-900"
          iconBg="bg-green-500"
        />
        <StatsCard
          title="Đang ca làm"
          value={mockStats.shiftActiveStaff}
          icon={Activity}
          gradientFrom="from-orange-50"
          gradientTo="to-orange-100/50"
          textColor="text-orange-900"
          iconBg="bg-orange-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Staff Distribution Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Phân bố nhân viên theo trạm</h3>
            </div>
            <div className="space-y-4">
              {mockStats.staffByStation.map((station) => (
                <div key={station.stationId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-slate-800">{station.stationName}</div>
                    <div className="text-sm text-slate-500">ID: {station.stationId}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-blue-600">{station.count}</div>
                    <div className="text-sm text-slate-500">nhân viên</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Shift Coverage */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <StaffShiftCoverage staff={mockStaff} />
        </div>
      </div>

      {/* Recent Activities */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50/50 border-b border-slate-200/60">
          <CardTitle className="flex items-center text-lg font-bold text-slate-800">
            <div className="p-2 bg-green-100 rounded-xl mr-3">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-slate-50/50 transition-colors group">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-2 shadow-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                    {activity.description}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {new Intl.DateTimeFormat('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
