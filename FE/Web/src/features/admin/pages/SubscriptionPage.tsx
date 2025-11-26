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
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SubscriptionSubscriber
} from '@/services/api/subscriptionService';
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
  type?: 'change' | 'periodic';
  count_swap: number | null;
  quantity_slot: number | null;
  status: 'active' | 'inactive';
  subscribers?: SubscriptionSubscriber[];
  subscriberCount?: number;
}

// Helper function to convert API data to UI format
const convertApiToUI = (apiPlan: SubscriptionPlan): Subscription => ({
  id: apiPlan._id,
  subscriptionName: apiPlan.subscriptionName,
  description: apiPlan.description,
  price: apiPlan.price,
  durations: apiPlan.durations,
  type: apiPlan.type || 'change', // Default to 'change' for backward compatibility
  count_swap: apiPlan.count_swap,
  quantity_slot: apiPlan.quantity_slot,
  status: apiPlan.status,
  subscribers: apiPlan.subscribers ?? [],
  subscriberCount: apiPlan.subscriberCount ?? (apiPlan.subscribers ? apiPlan.subscribers.length : 0),
});

// Helper: convert UI to backend DTO
const convertUIToApi = (
  uiData: Partial<Subscription>
): CreateSubscriptionPlanRequest | UpdateSubscriptionPlanRequest => {
  const type = (uiData.type || 'change') as 'change' | 'periodic';
  const baseData: Partial<CreateSubscriptionPlanRequest & UpdateSubscriptionPlanRequest> = {
    subscriptionName: uiData.subscriptionName || '',
    price: uiData.price || 0,
    durations: uiData.durations || 1,
    type: type,
    description: uiData.description || '',
    status: (uiData.status || 'active') as 'active' | 'inactive',
  };

  // Only include count_swap and quantity_slot for 'change' type
  // For 'periodic' type, these fields are not included in the request
  if (type === 'change') {
    baseData.count_swap = uiData.count_swap ?? 0;
    baseData.quantity_slot = uiData.quantity_slot ?? 0;
  }
  // For periodic type, we don't set these fields (they remain undefined and won't be sent to backend)

  return baseData;
};

const PlanSchema = Yup.object({
  subscriptionName: Yup.string().trim().required('Plan name is required'),
  price: Yup.number().typeError('Price must be a number').min(0, 'Price cannot be negative').required('Price is required'),
  durations: Yup.number().typeError('Durations must be a number').min(1, 'Durations must be at least 1').required('Durations is required'),
  type: Yup.mixed<'change' | 'periodic'>().oneOf(['change', 'periodic']).required('Type is required'),
  count_swap: Yup.number()
    .typeError('Count swap must be a number')
    .when('type', {
      is: 'change',
      then: (schema) => schema.min(0, 'Count swap must be >= 0').required('Count swap is required for change type'),
      otherwise: (schema) => schema.notRequired().nullable()
    }),
  quantity_slot: Yup.number()
    .typeError('Quantity slot must be a number')
    .when('type', {
      is: 'change',
      then: (schema) => schema.min(1, 'Quantity slot must be at least 1').required('Quantity slot is required for change type'),
      otherwise: (schema) => schema.notRequired().nullable()
    }),
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
    type: 'change',
    count_swap: 0,
    quantity_slot: 0,
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);
  const [selectedSubscriptionForSubscribers, setSelectedSubscriptionForSubscribers] = useState<Subscription | null>(null);

  const filteredSubscriptions = subscriptions;

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
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
    setFormData({ subscriptionName: '', description: '', price: 0, durations: 1, type: 'change', count_swap: 0, quantity_slot: 0, status: 'active' });
    setSubmitError(null);
    setFieldErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    const type = subscription.type || 'change';
    setFormData({
      subscriptionName: subscription.subscriptionName,
      description: subscription.description,
      price: subscription.price,
      durations: subscription.durations,
      type: type,
      // Only set count_swap and quantity_slot for 'change' type, undefined for 'periodic'
      count_swap: type === 'change' ? subscription.count_swap : undefined,
      quantity_slot: type === 'change' ? subscription.quantity_slot : undefined,
      status: subscription.status
    });
    setEditSubmitError(null);
    setFieldErrors({});
    setIsEditModalOpen(true);
  };

  // removed feature management from forms per requirements

  const handleSaveAdd = async () => {
    // Prepare data for validation - remove undefined values for periodic type
    const dataToValidate = { ...formData };
    if (dataToValidate.type === 'periodic') {
      // Remove count_swap and quantity_slot for periodic type to avoid validation issues
      delete dataToValidate.count_swap;
      delete dataToValidate.quantity_slot;
    }
    
    try {
      await PlanSchema.validate(dataToValidate, { abortEarly: false });
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'inner' in e && Array.isArray((e as { inner?: unknown }).inner)) {
        const errs: Record<string, string> = {};
        (e as { inner?: { path?: string; message: string }[] }).inner?.forEach((item) => {
          if (item.path && !errs[item.path]) errs[item.path] = item.message;
        });
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
    // Prepare data for validation - remove undefined values for periodic type
    const dataToValidate = { ...formData };
    if (dataToValidate.type === 'periodic') {
      // Remove count_swap and quantity_slot for periodic type to avoid validation issues
      delete dataToValidate.count_swap;
      delete dataToValidate.quantity_slot;
    }
    
    try {
      await PlanSchema.validate(dataToValidate, { abortEarly: false });
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'inner' in e && Array.isArray((e as { inner?: unknown }).inner)) {
        const errs: Record<string, string> = {};
        (e as { inner?: { path?: string; message: string }[] }).inner?.forEach((item) => {
          if (item.path && !errs[item.path]) errs[item.path] = item.message;
        });
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

  const handleOpenSubscribersModal = (subscription: Subscription) => {
    setSelectedSubscriptionForSubscribers(subscription);
    setIsSubscribersModalOpen(true);
  };

  const handleCloseSubscribersModal = () => {
    setSelectedSubscriptionForSubscribers(null);
    setIsSubscribersModalOpen(false);
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
      toast.success('Successfully deleted subscription plan');
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string }).message ||
        'Unable to delete subscription plan';

      // Check if the error indicates the plan is in use
      if (errorMessage.toLowerCase().includes('in use') ||
        errorMessage.toLowerCase().includes('active duration') ||
        errorMessage.toLowerCase().includes('cannot delete plan')) {
        // Show user-friendly info modal instead of error
        setIsConfirmationModalOpen(false);
        setInfoMessage('Cannot delete plan while it is within its active duration and in use by drivers');
        setIsInfoModalOpen(true);
        setDeletingSubscription(null);
      } else {
        setSubmitError(errorMessage);
        toast.error(errorMessage);
      }
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 xl:gap-8">
        {filteredSubscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className="p-4 sm:p-6 bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-lg relative overflow-hidden flex flex-col h-full min-w-0"
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
            <div className="mb-4 space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 break-words">{subscription.subscriptionName}</h3>
              <p className="inline-block text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-1 break-words">
                {subscription.description}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>
                  Subscribers:&nbsp;
                  <span className="font-semibold text-slate-700">
                    {subscription.subscriberCount ?? (subscription.subscribers ? subscription.subscribers.length : 0)}
                  </span>
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-baseline justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-blue-600 break-words">{formatCurrency(subscription.price)}</span>
              </div>
              <div className="flex items-center justify-center mt-1 text-slate-600">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm">{subscription.durations} days</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4 space-y-2 flex-grow">
              {/* Swap summary removed per request */}
            </div>

            {/* Stats - Only show for 'change' type */}
            {subscription.type === 'change' && (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 pt-2">
                <div className="text-center">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1 text-slate-500" />
                  <p className="text-xs text-slate-500">Slots</p>
                  <p className="font-bold text-sm sm:text-base text-slate-800">{subscription.quantity_slot}</p>
                </div>
                <div className="text-center">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1 text-slate-500" />
                  <p className="text-xs text-slate-500">Swaps</p>
                  <p className="font-bold text-sm sm:text-base text-slate-800">{subscription.count_swap}</p>
                </div>
              </div>
            )}
            
            {/* Type badge */}
            <div className="mb-4 flex justify-center">
              <Badge
                variant="outline"
                className={subscription.type === 'change' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-purple-50 text-purple-700 border-purple-200'}
              >
                {subscription.type === 'change' ? 'Change' : 'Periodic'}
              </Badge>
            </div>

            {/* Actions - This will be pushed to the bottom */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenSubscribersModal(subscription)}
                disabled={actionLoading || (subscription.subscriberCount ?? 0) === 0}
                className="px-3 sm:px-4 py-2 text-[11px] sm:text-xs bg-white text-slate-800 border-slate-200 hover:bg-slate-50 rounded-md col-span-3 sm:col-span-1"
              >
                View subscribers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditModal(subscription)}
                disabled={actionLoading}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white text-slate-800 border-slate-200 hover:bg-slate-50 rounded-md"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(subscription)}
                disabled={actionLoading}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white text-red-600 border-red-200 hover:bg-red-50 rounded-md"
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
                  <SelectContent className="z-[102]">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="after:ml-1 after:text-red-500 after:content-['*']">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'change' | 'periodic') => {
                  const newFormData = { ...formData, type: value };
                  // Reset count_swap and quantity_slot when switching to periodic
                  if (value === 'periodic') {
                    // Set to undefined instead of 0 to avoid validation issues
                    newFormData.count_swap = undefined;
                    newFormData.quantity_slot = undefined;
                  } else if (value === 'change') {
                    // Initialize with 0 if not set when switching to change
                    if (newFormData.count_swap === undefined || newFormData.count_swap === null) {
                      newFormData.count_swap = 0;
                    }
                    if (newFormData.quantity_slot === undefined || newFormData.quantity_slot === null) {
                      newFormData.quantity_slot = 0;
                    }
                  }
                  // Clear field errors for count_swap and quantity_slot when type changes
                  const newFieldErrors = { ...fieldErrors };
                  if (value === 'periodic') {
                    delete newFieldErrors.count_swap;
                    delete newFieldErrors.quantity_slot;
                  } else if (value === 'change') {
                    // Clear errors when switching to change to allow fresh validation
                    delete newFieldErrors.count_swap;
                    delete newFieldErrors.quantity_slot;
                  }
                  setFieldErrors(newFieldErrors);
                  setFormData(newFormData);
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-[102]">
                  <SelectItem value="change">Change</SelectItem>
                  <SelectItem value="periodic">Periodic</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.type && (<div className="text-sm text-red-600">{fieldErrors.type}</div>)}
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

            <div className="grid grid-cols-2 gap-4">
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
                {fieldErrors.price && (<div className="text-sm text-red-600">{fieldErrors.price}</div>)}
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
                {fieldErrors.durations && (<div className="text-sm text-red-600">{fieldErrors.durations}</div>)}
              </div>
            </div>

            {formData.type === 'change' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qty" className="after:ml-1 after:text-red-500 after:content-['*']">Quantity slot</Label>
                  <Input
                    id="qty"
                    type="number"
                    placeholder="0"
                    value={formData.quantity_slot !== undefined && formData.quantity_slot !== null ? formData.quantity_slot : ''}
                    onChange={(e) => setFormData({ ...formData, quantity_slot: parseInt(e.target.value) || 0 })}
                    className="bg-white"
                  />
                  {fieldErrors.quantity_slot && (<div className="text-sm text-red-600">{fieldErrors.quantity_slot}</div>)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swapLimit" className="after:ml-1 after:text-red-500 after:content-['*']">Count swap</Label>
                  <Input
                    id="swapLimit"
                    type="number"
                    placeholder="0"
                    value={formData.count_swap !== undefined && formData.count_swap !== null ? formData.count_swap : ''}
                    onChange={(e) => setFormData({ ...formData, count_swap: parseInt(e.target.value) || 0 })}
                    className="bg-white"
                  />
                  {fieldErrors.count_swap && (<div className="text-sm text-red-600">{fieldErrors.count_swap}</div>)}
                </div>
              </div>
            )}

            {fieldErrors.description && (<div className="text-sm text-red-600">{fieldErrors.description}</div>)}

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
                  <SelectContent className="z-[102]">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type" className="after:ml-1 after:text-red-500 after:content-['*']">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'change' | 'periodic') => {
                  const newFormData = { ...formData, type: value };
                  // Reset count_swap and quantity_slot when switching to periodic
                  if (value === 'periodic') {
                    // Set to undefined instead of 0 to avoid validation issues
                    newFormData.count_swap = undefined;
                    newFormData.quantity_slot = undefined;
                  } else if (value === 'change') {
                    // Initialize with 0 if not set when switching to change
                    if (newFormData.count_swap === undefined || newFormData.count_swap === null) {
                      newFormData.count_swap = 0;
                    }
                    if (newFormData.quantity_slot === undefined || newFormData.quantity_slot === null) {
                      newFormData.quantity_slot = 0;
                    }
                  }
                  // Clear field errors for count_swap and quantity_slot when type changes
                  const newFieldErrors = { ...fieldErrors };
                  if (value === 'periodic') {
                    delete newFieldErrors.count_swap;
                    delete newFieldErrors.quantity_slot;
                  } else if (value === 'change') {
                    // Clear errors when switching to change to allow fresh validation
                    delete newFieldErrors.count_swap;
                    delete newFieldErrors.quantity_slot;
                  }
                  setFieldErrors(newFieldErrors);
                  setFormData(newFormData);
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-[102]">
                  <SelectItem value="change">Change</SelectItem>
                  <SelectItem value="periodic">Periodic</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.type && (<div className="text-sm text-red-600">{fieldErrors.type}</div>)}
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {formData.type === 'change' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-qty" className="after:ml-1 after:text-red-500 after:content-['*']">Quantity slot</Label>
                  <Input
                    id="edit-qty"
                    type="number"
                    placeholder="0"
                    value={formData.quantity_slot !== undefined && formData.quantity_slot !== null ? formData.quantity_slot : ''}
                    onChange={(e) => setFormData({ ...formData, quantity_slot: parseInt(e.target.value) || 0 })}
                    className="bg-white"
                  />
                  {fieldErrors.quantity_slot && (<div className="text-sm text-red-600">{fieldErrors.quantity_slot}</div>)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-swapLimit" className="after:ml-1 after:text-red-500 after:content-['*']">Count swap</Label>
                  <Input
                    id="edit-swapLimit"
                    type="number"
                    placeholder="0"
                    value={formData.count_swap !== undefined && formData.count_swap !== null ? formData.count_swap : ''}
                    onChange={(e) => setFormData({ ...formData, count_swap: parseInt(e.target.value) || 0 })}
                    className="bg-white"
                  />
                  {fieldErrors.count_swap && (<div className="text-sm text-red-600">{fieldErrors.count_swap}</div>)}
                </div>
              </div>
            )}

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

      {/* Info Modal for when plan cannot be deleted */}
      <ConfirmationModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setInfoMessage(null);
        }}
        onConfirm={() => {
          setIsInfoModalOpen(false);
          setInfoMessage(null);
        }}
        title="Cannot Delete Subscription Plan"
        message={
          <div>
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 mb-4 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <span className="font-medium">{infoMessage}</span>
            </div>
            <p className="text-slate-600">
              Please wait until all drivers have completed their subscriptions or deactivate the plan instead.
            </p>
          </div>
        }
        confirmText="OK"
        type="delete"
        isLoading={false}
        showWarning={false}
      />

      {/* Subscribers list modal */}
      <Dialog open={isSubscribersModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseSubscribersModal();
        } else if (selectedSubscriptionForSubscribers) {
          setIsSubscribersModalOpen(true);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Subscribers for {selectedSubscriptionForSubscribers?.subscriptionName}
            </DialogTitle>
            <DialogDescription>
              List of users currently registered to this subscription plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {(selectedSubscriptionForSubscribers?.subscribers?.length ?? 0) === 0 && (
              <div className="text-center py-6 text-slate-600">
                No subscribers for this plan yet.
              </div>
            )}

            {selectedSubscriptionForSubscribers?.subscribers && selectedSubscriptionForSubscribers.subscribers.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-6 gap-2 px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-700">
                  <span>User name</span>
                  <span>Email</span>
                  <span>Phone</span>
                  <span>Start date</span>
                  <span>End date</span>
                  <span>Remaining / Status</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {selectedSubscriptionForSubscribers.subscribers.map((sub) => (
                    <div key={sub.id} className="grid grid-cols-6 gap-2 px-4 py-2 text-xs text-slate-700">
                      <span className="truncate" title={sub.user.fullName}>{sub.user.fullName}</span>
                      <span className="truncate" title={sub.user.email}>{sub.user.email}</span>
                      <span className="truncate" title={sub.user.phoneNumber}>{sub.user.phoneNumber}</span>
                      <span>
                        {new Date(sub.start_date).toLocaleDateString('vi-VN')}
                      </span>
                      <span>
                        {new Date(sub.end_date).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="truncate">
                        {sub.remaining_swaps} swaps • {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseSubscribersModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

