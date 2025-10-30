import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import type { Staff, AddStaffRequest, UpdateStaffRequest, StaffRole, Station } from '../types/staff';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddStaffRequest | UpdateStaffRequest) => Promise<void> | void;
  staff?: Staff | null;
  stations: Station[];
  isSaving?: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: Yup.string().required('Email is required').email('Invalid email format'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10,11}$/, 'Invalid phone number'),
  role: Yup.string().required(),
  stationId: Yup.string().required('Please select a station'),
});

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staff,
  stations,
  isSaving = false
}) => {
  const initialValues = React.useMemo(() => ({
    name: staff ? staff.name : '',
    email: staff ? staff.email : '',
    phone: staff ? staff.phone : '',
    role: staff ? staff.role : 'STAFF',
    stationId: staff ? staff.stationId : '',
  }), [staff]);

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => { // clear error on open
    setSubmitError(null);
  }, [isOpen, staff]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              setSubmitError(null);
              const normalized = {
                ...values,
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                phone: values.phone.replace(/\s/g, ''),
              };
              if (staff) {
                const updateData: UpdateStaffRequest = { id: staff.id, ...normalized };
                await onSave(updateData);
              } else {
                const addData: AddStaffRequest = normalized;
                await onSave(addData);
              }
            } catch (e: any) {
              // Show error in modal, not toast
              const msg = e?.message || 'Unable to save staff. Please try again.';
              setSubmitError(msg);
              // Optionally: setErrors({general: msg});
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, isValid }) => (
            <Form className="space-y-6">
              <Card className="border-0 shadow-none">
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Field as={Input}
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter full name"
                        className={errors.name && touched.name ? 'border-red-500' : ''}
                      />
                      {errors.name && touched.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Field as={Input}
                        id="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter email"
                        className={errors.email && touched.email ? 'border-red-500' : ''}
                      />
                      {errors.email && touched.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Field as={Input}
                        id="phone"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter phone number"
                        className={errors.phone && touched.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && touched.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={values.role}
                        onValueChange={(v) => setFieldValue('role', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          <SelectItem value="STAFF">Staff</SelectItem>
                          <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="station">Working Station *</Label>
                      <Select
                        value={values.stationId}
                        onValueChange={(v) => setFieldValue('stationId', v)}
                      >
                        <SelectTrigger className={errors.stationId && touched.stationId ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select station" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {stations.map((station) => (
                            <SelectItem key={station.id} value={station.id}>
                              {station.name} - {station.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.stationId && touched.stationId && <p className="text-sm text-red-500">{errors.stationId}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Show submit-level error (API/user exists etc.) below fields, above buttons */}
              {submitError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 mr-1 text-red-600 flex-shrink-0" />
                  <span className="font-medium">{submitError}</span>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving || isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || isSubmitting || !isValid}>
                  {(isSaving || isSubmitting) ? (
                    <ButtonLoadingSpinner size="sm" variant="default" text="Saving..." />
                  ) : (
                    staff ? 'Update' : 'Add New'
                  )}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
