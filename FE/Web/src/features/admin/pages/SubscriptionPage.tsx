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
  DollarSign,
  Clock,
  Zap,
  Users,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { SubscriptionService } from '@/services/api/subscriptionService';
import type { SubscriptionPlan, CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest } from '@/services/api/subscriptionService';
import * as Yup from 'yup';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { toast } from 'sonner';

// Legacy interface for backward compatibility with UI
interface Subscription {
  id: string;
  subscriptionName: string;
  description: string;
  price: number;
  durations: number;
  count_swap: number;
  quantity_slot: number;
  status: 'active' | 'inactive';
}

// Helper function to convert API data to UI format
const convertApiToUI = (apiPlan: SubscriptionPlan): Subscription => ({
  id: apiPlan._id,
  subscriptionName: apiPlan.subscriptionName,
  description: apiPlan.description,
  price: apiPlan.price,
  durations: apiPlan.durations,
  count_swap: apiPlan.count_swap,
  quantity_slot: apiPlan.quantity_slot,
  status: apiPlan.status,
});

// Helper: convert UI to backend DTO
const convertUIToApi = (uiData: Partial<Subscription>): CreateSubscriptionPlanRequest | UpdateSubscriptionPlanRequest => ({
  subscriptionName: uiData.subscriptionName || '',
  price: uiData.price || 0,
  durations: uiData.durations || 1,
  count_swap: uiData.count_swap || 0,
  quantity_slot: uiData.quantity_slot || 0,
  description: uiData.description || '',
  status: (uiData.status || 'active') as 'active' | 'inactive',
});

const PlanSchema = Yup.object({
  subscriptionName: Yup.string().trim().required('Plan name is required'),
  price: Yup.number().typeError('Price must be a number').min(0, 'Price cannot be negative').required('Price is required'),
  durations: Yup.number().typeError('Durations must be a number').min(1, 'Durations must be at least 1').required('Durations is required'),
  count_swap: Yup.number().typeError('Count swap must be a number').min(0, 'Count swap must be >= 0'),
  quantity_slot: Yup.number().typeError('Quantity slot must be a number').min(0, 'Quantity slot must be >= 0'),
  status: Yup.mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']).required('Status is required'),
  description: Yup.string().trim().max(200, 'Description too long')
});

export const SubscriptionPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<Partial<Subscription>>({
    subscriptionName: '',
    description: '',
    price: 0,
    durations: 1,
    count_swap: 0,
    quantity_slot: 0,
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const filteredSubscriptions = subscriptions;

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const totalSubscribers = subscriptions.length;
  const activePackages = subscriptions.filter(sub => sub.status === 'active').length;

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const plans = await SubscriptionService.getAllPlans();
      const convertedPlans = plans.map(convertApiToUI);
      setSubscriptions(convertedPlans);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to load subscription plans list';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load subscription plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Validation helper
  // no-op legacy validator removed; using Yup instead

  const handleOpenAddModal = () => {
    setFormData({ subscriptionName: '', description: '', price: 0, durations: 1, count_swap: 0, quantity_slot: 0, status: 'active' });
    setSubmitError(null);
    setFieldErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      subscriptionName: subscription.subscriptionName,
      description: subscription.description,
      price: subscription.price,
      durations: subscription.durations,
      count_swap: subscription.count_swap,
      quantity_slot: subscription.quantity_slot,
      status: subscription.status
    });
    setEditSubmitError(null);
    setFieldErrors({});
    setIsEditModalOpen(true);
  };

  // removed feature management from forms per requirements

  const handleSaveAdd = async () => {
    try {
      await PlanSchema.validate(formData, { abortEarly: false });
    } catch (e) {
      if ((e as any).inner) {
        const errs: Record<string, string> = {};
        (e as any).inner.forEach((item: any) => { if (item.path && !errs[item.path]) errs[item.path] = item.message; });
        setFieldErrors(errs);
      }
      setSubmitError(null);
      return;
    }
    setFieldErrors({});
    setSubmitError(null);
    try {
      setActionLoading(true);
      const apiData = convertUIToApi(formData) as CreateSubscriptionPlanRequest;
      await SubscriptionService.createPlan(apiData);
      // Re-fetch to ensure full display
      await fetchPlans();
      setIsAddModalOpen(false);
      toast.success('Successfully created subscription plan');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to create subscription plan';
      setSubmitError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await PlanSchema.validate(formData, { abortEarly: false });
    } catch (e) {
      if ((e as any).inner) {
        const errs: Record<string, string> = {};
        (e as any).inner.forEach((item: any) => { if (item.path && !errs[item.path]) errs[item.path] = item.message; });
        setFieldErrors(errs);
      }
      setEditSubmitError(null);
      return;
    }
    setFieldErrors({});
    setEditSubmitError(null);
    if (editingSubscription) {
      try {
        setActionLoading(true);
        const apiData = convertUIToApi(formData) as UpdateSubscriptionPlanRequest;
        await SubscriptionService.updatePlan(editingSubscription.id, apiData);
        await fetchPlans();
        setIsEditModalOpen(false);
        setEditingSubscription(null);
        toast.success('Successfully updated subscription plan');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unable to update subscription plan';
        setEditSubmitError(errorMessage);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDelete = (subscription: Subscription) => {
    setDeletingSubscription(subscription);
    setSubmitError(null);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubscription) return;
    setSubmitError(null);
    try {
      setActionLoading(true);
      await SubscriptionService.deletePlan(deletingSubscription.id);
      // Re-fetch to ensure the list is fully accurate
      await fetchPlans();
      setIsConfirmationModalOpen(false);
      setDeletingSubscription(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to delete subscription plan';
      setSubmitError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationModalOpen(false);
    setDeletingSubscription(null);
    setSubmitError(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600">Loading subscription plans list...</p>
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
              onClick={fetchPlans}
              variant="outline"
              className="mt-4"
            >
              Retry
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
          <h1 className="text-3xl font-bold text-slate-800">Subscription Management</h1>
          <p className="text-slate-600 mt-1">Manage battery rental plans and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchPlans}
            disabled={loading}
            className="hover:bg-slate-100 border-slate-200"
          >
            {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <></>}
            Refresh
          </Button>
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
            Add New Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          gradientFrom="from-blue-50"
          gradientTo="to-blue-100/50"
          textColor="text-blue-900"
          iconBg="bg-blue-500"
        />
        <StatsCard
          title="Subscribers"
          value={totalSubscribers.toLocaleString()}
          icon={Users}
          gradientFrom="from-green-50"
          gradientTo="to-green-100/50"
          textColor="text-green-900"
          iconBg="bg-green-500"
        />
        <StatsCard
          title="Active Plans"
          value={activePackages}
          icon={Zap}
          gradientFrom="from-purple-50"
          gradientTo="to-purple-100/50"
          textColor="text-purple-900"
          iconBg="bg-purple-500"
        />
        <StatsCard
          title="Avg Revenue/Plan"
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
                {subscription.status === 'active' ? 'Active' : 'Suspended'}
              </Badge>
            </div>

            {/* Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{subscription.subscriptionName}</h3>
              <p className="inline-block text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-1">{subscription.description}</p>
            </div>

            {/* Price */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-baseline justify-center">
                <span className="text-3xl font-bold text-blue-600">{formatCurrency(subscription.price)}</span>
              </div>
              <div className="flex items-center justify-center mt-1 text-slate-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{subscription.durations} days</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4 space-y-2 flex-grow">
              {/* Swap summary removed per request */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 pt-2">
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-slate-500" />
                <p className="text-xs text-slate-500">Slots</p>
                <p className="font-bold text-slate-800">{subscription.quantity_slot}</p>
              </div>
              <div className="text-center">
                <Zap className="h-4 w-4 mx-auto mb-1 text-slate-500" />
                <p className="text-xs text-slate-500">Swaps</p>
                <p className="font-bold text-slate-800">{subscription.count_swap}</p>
              </div>
            </div>

            {/* Actions - This will be pushed to the bottom */}
            <div className="flex gap-3 mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditModal(subscription)}
                disabled={actionLoading}
                className="px-5 py-2 bg-white text-slate-800 border-slate-200 hover:bg-slate-50 rounded-md"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(subscription)}
                disabled={actionLoading}
                className="px-5 py-2 bg-white text-red-600 border-red-200 hover:bg-red-50 rounded-md"
              >
                Delete
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
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No plans found</h3>
          <p className="text-slate-600">Try searching with different keywords or add a new plan</p>
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        setIsAddModalOpen(open);
        if (!open) setSubmitError(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Add New Plan</DialogTitle>
            <DialogDescription>Fill in information to create a new battery rental plan</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="after:ml-1 after:text-red-500 after:content-['*']">Plan Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Premium Plan"
                  value={formData.subscriptionName as string}
                  onChange={(e) => setFormData({ ...formData, subscriptionName: e.target.value })}
                  className={`bg-white ${fieldErrors.subscriptionName ? 'border-red-500' : ''}`}
                />
                {fieldErrors.subscriptionName && (<div className="text-sm text-red-600">{fieldErrors.subscriptionName}</div>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="after:ml-1 after:text-red-500 after:content-['*']">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="after:ml-1 after:text-red-500 after:content-['*']">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the plan"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="after:ml-1 after:text-red-500 after:content-['*']">Price (VND)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="299000"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="after:ml-1 after:text-red-500 after:content-['*']">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={formData.durations || ''}
                  onChange={(e) => setFormData({ ...formData, durations: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="swapLimit" className="after:ml-1 after:text-red-500 after:content-['*']">Count swap</Label>
                <Input
                  id="swapLimit"
                  type="number"
                  placeholder="0"
                  value={formData.count_swap || ''}
                  onChange={(e) => setFormData({ ...formData, count_swap: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qty" className="after:ml-1 after:text-red-500 after:content-['*']">Quantity slot</Label>
                <Input
                  id="qty"
                  type="number"
                  placeholder="0"
                  value={formData.quantity_slot || ''}
                  onChange={(e) => setFormData({ ...formData, quantity_slot: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>
              {fieldErrors.description && (<div className="text-sm text-red-600">{fieldErrors.description}</div>)}
              {fieldErrors.price && (<div className="text-sm text-red-600">{fieldErrors.price}</div>)}
              {fieldErrors.durations && (<div className="text-sm text-red-600">{fieldErrors.durations}</div>)}
              {fieldErrors.count_swap && (<div className="text-sm text-red-600">{fieldErrors.count_swap}</div>)}
              {fieldErrors.quantity_slot && (<div className="text-sm text-red-600">{fieldErrors.quantity_slot}</div>)}
            </div>

            {/* Features removed per requirement */}
            {submitError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-2 rounded-lg">
                <AlertCircle className="h-5 w-5 mr-1 text-red-600 flex-shrink-0" />
                <span className="font-medium">{submitError}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAdd}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) setEditSubmitError(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Edit Plan</DialogTitle>
            <DialogDescription>Update battery rental plan information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="after:ml-1 after:text-red-500 after:content-['*']">Plan Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Premium Plan"
                  value={formData.subscriptionName as string}
                  onChange={(e) => setFormData({ ...formData, subscriptionName: e.target.value })}
                  className={`bg-white ${fieldErrors.subscriptionName ? 'border-red-500' : ''}`}
                />
                {fieldErrors.subscriptionName && (<div className="text-sm text-red-600">{fieldErrors.subscriptionName}</div>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status" className="after:ml-1 after:text-red-500 after:content-['*']">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="after:ml-1 after:text-red-500 after:content-['*']">Description</Label>
              <Input
                id="edit-description"
                placeholder="Brief description of the plan"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="after:ml-1 after:text-red-500 after:content-['*']">Price (VND)</Label>
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
                <Label htmlFor="edit-duration" className="after:ml-1 after:text-red-500 after:content-['*']">Duration (days)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  placeholder="30"
                  value={formData.durations}
                  onChange={(e) => setFormData({ ...formData, durations: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-swapLimit" className="after:ml-1 after:text-red-500 after:content-['*']">Count swap</Label>
                <Input
                  id="edit-swapLimit"
                  type="number"
                  placeholder="0"
                  value={formData.count_swap}
                  onChange={(e) => setFormData({ ...formData, count_swap: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-qty" className="after:ml-1 after:text-red-500 after:content-['*']">Quantity slot</Label>
                <Input
                  id="edit-qty"
                  type="number"
                  placeholder="0"
                  value={formData.quantity_slot}
                  onChange={(e) => setFormData({ ...formData, quantity_slot: parseInt(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Features removed per requirement */}
            {editSubmitError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-2 rounded-lg">
                <AlertCircle className="h-5 w-5 mr-1 text-red-600 flex-shrink-0" />
                <span className="font-medium">{editSubmitError}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal: show submitError if any, above the buttons */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Confirm delete subscription ${deletingSubscription?.subscriptionName}`}
        message={
          <div>
            Are you sure you want to delete <span className="font-bold text-slate-800">{deletingSubscription?.subscriptionName}</span>?<br />
            <span className="text-red-600 font-medium">This action cannot be undone.</span>
            {submitError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 mt-4 mb-1 rounded-lg">
                <AlertCircle className="h-5 w-5 mr-1 text-red-600 flex-shrink-0" />
                <span className="font-medium">{submitError}</span>
              </div>
            )}
          </div>
        }
        confirmText="Delete"
        type="delete"
        isLoading={actionLoading}
      />
    </div>
  );
};

