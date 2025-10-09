import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import type { Staff } from '../types/staff';

interface StaffShiftCoverageProps {
  staff: Staff[];
}

export const StaffShiftCoverage: React.FC<StaffShiftCoverageProps> = ({ staff }) => {
  // Mock shift data - trong thực tế sẽ lấy từ API
  const shifts = [
    { id: '1', name: 'Ca sáng', startTime: '06:00', endTime: '14:00', color: 'bg-blue-500' },
    { id: '2', name: 'Ca chiều', startTime: '14:00', endTime: '22:00', color: 'bg-green-500' },
    { id: '3', name: 'Ca đêm', startTime: '22:00', endTime: '06:00', color: 'bg-purple-500' },
  ];

  const getStaffByShift = () => {
    return shifts.map(shift => {
      const staffInShift = staff.filter(s => {
        if (s.status !== 'SHIFT_ACTIVE') return false;
        // Mock logic - trong thực tế sẽ dựa trên thời gian ca làm việc
        return Math.random() > 0.5; // Random for demo
      });

      return {
        ...shift,
        staffCount: staffInShift.length,
        staff: staffInShift,
        coverage: staffInShift.length >= 2 ? 'good' : staffInShift.length === 1 ? 'warning' : 'critical'
      };
    });
  };

  const shiftData = getStaffByShift();

  const getCoverageIcon = (coverage: string) => {
    switch (coverage) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCoverageText = (coverage: string) => {
    switch (coverage) {
      case 'good':
        return 'Đủ nhân viên';
      case 'warning':
        return 'Thiếu nhân viên';
      case 'critical':
        return 'Cần bổ sung';
      default:
        return 'Không xác định';
    }
  };

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'good':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Phân ca làm việc
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shiftData.map((shift) => (
            <div key={shift.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${shift.color}`}></div>
                  <div>
                    <div className="font-medium">{shift.name}</div>
                    <div className="text-sm text-gray-500">
                      {shift.startTime} - {shift.endTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getCoverageIcon(shift.coverage)}
                  <span className={`text-sm px-2 py-1 rounded-full ${getCoverageColor(shift.coverage)}`}>
                    {getCoverageText(shift.coverage)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {shift.staffCount} nhân viên đang làm việc
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Tối thiểu: 2 nhân viên
                </div>
              </div>

              {/* Staff List */}
              {shift.staff.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex flex-wrap gap-2">
                    {shift.staff.map((staffMember) => (
                      <div
                        key={staffMember.id}
                        className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded text-sm"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{staffMember.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {shiftData.filter(s => s.coverage === 'good').length}
                </div>
                <div className="text-xs text-gray-500">Ca đủ nhân viên</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {shiftData.filter(s => s.coverage === 'warning').length}
                </div>
                <div className="text-xs text-gray-500">Ca thiếu nhân viên</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {shiftData.filter(s => s.coverage === 'critical').length}
                </div>
                <div className="text-xs text-gray-500">Ca cần bổ sung</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
