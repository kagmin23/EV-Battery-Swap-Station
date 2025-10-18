import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { StatsCard } from '../components/StatsCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Zap,
  Users,
  TrendingUp,
  Calendar,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { SubscriptionService } from '@/services/api/subscriptionService';
import type { SubscriptionPlan, CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest } from '@/services/api/subscriptionService';
import { toast } from 'sonner';

// Legacy interface for backward compatibility with UI
interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  swapLimit: number; // number of swaps per duration
  features: string[];
  status: 'active' | 'inactive';
  subscriberCount: number;
  revenue: number;
}

// Helper function to convert API data to UI format
const convertApiToUI = (apiPlan: SubscriptionPlan): Subscription => {
  return {
    id: apiPlan._id,
    name: apiPlan.subcriptionName,
    description: `Gói ${apiPlan.period === 'yearly' ? 'năm' : 'tháng'}`,
    price: apiPlan.price,
    duration: apiPlan.period === 'yearly' ? 365 : 30,
    swapLimit: -1, // Default to unlimited, can be enhanced later
    features: apiPlan.benefits || [],
    status: apiPlan.status === 'active' ? 'active' : 'inactive',
    subscriberCount: 0, // This would need to be calculated from actual subscriptions
    revenue: 0 // This would need to be calculated from actual revenue
  };
};

// Helper function to convert UI data to API format
const convertUIToApi = (uiData: Partial<Subscription>): CreateSubscriptionPlanRequest | UpdateSubscriptionPlanRequest => {
  const baseData = {
    subcriptionName: uiData.name || '',
    price: uiData.price || 0,
    period: (uiData.duration === 365 ? 'yearly' : 'monthly') as 'monthly' | 'yearly',
    benefits: uiData.features || [],
    status: (uiData.status === 'active' ? 'active' : 'expired') as 'active' | 'expired',
    duration_months: uiData.duration === 365 ? 12 : 1,
    // Legacy fields for backward compatibility
    name: uiData.name,
    active: uiData.status === 'active'
  };

  return baseData;
};

export const SubscriptionPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    swapLimit: 0,
    features: [],
    status: 'active'
  });
  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredSubscriptions = subscriptions;

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.revenue, 0);
  const totalSubscribers = subscriptions.reduce((sum, sub) => sum + sub.subscriberCount, 0);
  const activePackages = subscriptions.filter(sub => sub.status === 'active').length;

  // Load subscription plans on component mount
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const plans = await SubscriptionService.getAllPlans();
        const convertedPlans = plans.map(convertApiToUI);
        setSubscriptions(convertedPlans);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách gói thuê';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      swapLimit: 0,
      features: [],
      status: 'active'
    });
    setNewFeature('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      description: subscription.description,
      price: subscription.price,
      duration: subscription.duration,
      swapLimit: subscription.swapLimit,
      features: [...subscription.features],
      status: subscription.status
    });
    setNewFeature('');
    setIsEditModalOpen(true);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...(formData.features || [])];
    updatedFeatures.splice(index, 1);
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleSaveAdd = async () => {
    try {
      setActionLoading(true);
      const apiData = convertUIToApi(formData) as CreateSubscriptionPlanRequest;
      const newPlan = await SubscriptionService.createPlan(apiData);
      const convertedPlan = convertApiToUI(newPlan);
      setSubscriptions([...subscriptions, convertedPlan]);
      setIsAddModalOpen(false);
      toast.success('Tạo gói thuê thành công');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo gói thuê';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editingSubscription) {
      try {
        setActionLoading(true);
        const apiData = convertUIToApi(formData) as UpdateSubscriptionPlanRequest;
        const updatedPlan = await SubscriptionService.updatePlan(editingSubscription.id, apiData);
        const convertedPlan = convertApiToUI(updatedPlan);
        const updatedSubscriptions = subscriptions.map(sub =>
          sub.id === editingSubscription.id ? convertedPlan : sub
        );
        setSubscriptions(updatedSubscriptions);
        setIsEditModalOpen(false);
        setEditingSubscription(null);
        toast.success('Cập nhật gói thuê thành công');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật gói thuê';
        toast.error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói này?')) {
      try {
        setActionLoading(true);
        await SubscriptionService.deletePlan(id);
        setSubscriptions(subscriptions.filter(sub => sub.id !== id));
        toast.success('Xóa gói thuê thành công');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Không thể xóa gói thuê';
        toast.error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600">Đang tải danh sách gói thuê...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản lý gói thuê</h1>
          <p className="text-slate-600 mt-1">Quản lý các gói thuê pin và đăng ký</p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          disabled={actionLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        >
          {actionLoading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          Thêm gói mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng doanh thu"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          gradientFrom="from-blue-50"
          gradientTo="to-blue-100/50"
          textColor="text-blue-900"
          iconBg="bg-blue-500"
        />
        <StatsCard
          title="Người đăng ký"
          value={totalSubscribers.toLocaleString()}
          icon={Users}
          gradientFrom="from-green-50"
          gradientTo="to-green-100/50"
          textColor="text-green-900"
          iconBg="bg-green-500"
        />
        <StatsCard
          title="Gói đang hoạt động"
          value={activePackages}
          icon={Zap}
          gradientFrom="from-purple-50"
          gradientTo="to-purple-100/50"
          textColor="text-purple-900"
          iconBg="bg-purple-500"
        />
        <StatsCard
          title="TB doanh thu/gói"
          value={formatCurrency(totalRevenue / subscriptions.length)}
          icon={TrendingUp}
          gradientFrom="from-orange-50"
          gradientTo="to-orange-100/50"
          textColor="text-orange-900"
          iconBg="bg-orange-500"
        />
      </div>


      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSubscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-lg relative overflow-hidden flex flex-col h-full"
          >
            {/* Badge for status */}
            <div className="absolute top-4 right-4">
              <Badge
                variant={subscription.status === 'active' ? 'default' : 'secondary'}
                className={subscription.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
              >
                {subscription.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
              </Badge>
            </div>

            {/* Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{subscription.name}</h3>
              <p className="text-sm text-slate-600">{subscription.description}</p>
            </div>

            {/* Price */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-baseline justify-center">
                <span className="text-3xl font-bold text-blue-600">{formatCurrency(subscription.price)}</span>
              </div>
              <div className="flex items-center justify-center mt-1 text-slate-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{subscription.duration} ngày</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4 space-y-2 flex-grow">
              <div className="flex items-center text-sm">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="font-medium">
                  {subscription.swapLimit === -1
                    ? 'Không giới hạn'
                    : `${subscription.swapLimit} lần đổi pin`}
                </span>
              </div>
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-start text-sm text-slate-600">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-slate-500" />
                <p className="text-xs text-slate-500">Người dùng</p>
                <p className="font-bold text-slate-800">{subscription.subscriberCount}</p>
              </div>
              <div className="text-center">
                <DollarSign className="h-4 w-4 mx-auto mb-1 text-slate-500" />
                <p className="text-xs text-slate-500">Doanh thu</p>
                <p className="font-bold text-slate-800">{(subscription.revenue / 1000000).toFixed(1)}M</p>
              </div>
            </div>

            {/* Actions - This will be pushed to the bottom */}
            <div className="flex gap-2 mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditModal(subscription)}
                disabled={actionLoading}
                className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
              >
                <Edit className="h-4 w-4 mr-1" />
                Sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(subscription.id)}
                disabled={actionLoading}
                className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Xóa
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Không tìm thấy gói nào</h3>
          <p className="text-slate-600">Thử tìm kiếm với từ khóa khác hoặc thêm gói mới</p>
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Thêm gói mới</DialogTitle>
            <DialogDescription>Điền thông tin để tạo gói thuê pin mới</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên gói *</Label>
                <Input
                  id="name"
                  placeholder="VD: Gói Premium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                placeholder="Mô tả ngắn về gói"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="299000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Thời hạn (ngày) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="swapLimit">Số lần đổi *</Label>
                <Input
                  id="swapLimit"
                  type="number"
                  placeholder="10 (-1 = không giới hạn)"
                  value={formData.swapLimit}
                  onChange={(e) => setFormData({ ...formData, swapLimit: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tính năng</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tính năng..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  className="bg-white"
                />
                <Button type="button" onClick={handleAddFeature} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.features?.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="py-1 px-3">
                    {feature}
                    <button
                      onClick={() => handleRemoveFeature(index)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={actionLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveAdd}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Thêm gói'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Chỉnh sửa gói</DialogTitle>
            <DialogDescription>Cập nhật thông tin gói thuê pin</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên gói *</Label>
                <Input
                  id="edit-name"
                  placeholder="VD: Gói Premium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Input
                id="edit-description"
                placeholder="Mô tả ngắn về gói"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Giá (VNĐ) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  placeholder="299000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duration">Thời hạn (ngày) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-swapLimit">Số lần đổi *</Label>
                <Input
                  id="edit-swapLimit"
                  type="number"
                  placeholder="10 (-1 = không giới hạn)"
                  value={formData.swapLimit}
                  onChange={(e) => setFormData({ ...formData, swapLimit: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tính năng</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tính năng..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  className="bg-white"
                />
                <Button type="button" onClick={handleAddFeature} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.features?.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="py-1 px-3">
                    {feature}
                    <button
                      onClick={() => handleRemoveFeature(index)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={actionLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

