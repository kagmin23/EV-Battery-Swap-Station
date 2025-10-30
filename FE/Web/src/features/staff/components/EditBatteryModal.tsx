import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Battery, UpdateBatteryRequest } from '../apis/DashboardApi';

interface EditBatteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  battery: Battery | null;
  onSave: (batteryId: string, data: UpdateBatteryRequest) => Promise<void>;
}

export default function EditBatteryModal({ isOpen, onClose, battery, onSave }: EditBatteryModalProps) {
  const [status, setStatus] = useState<string>('');
  const [soh, setSoh] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (battery && isOpen) {
      setStatus(battery.status);
      setSoh(battery.soh.toString());
      setError('');
    }
  }, [battery, isOpen]);

  if (!isOpen || !battery) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sohValue = parseInt(soh);
    if (isNaN(sohValue) || sohValue < 0 || sohValue > 100) {
      setError('SOH must be a number from 0 to 100');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(battery._id, {
        status: status as Battery['status'],
        soh: sohValue,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update battery');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Update Battery</h2>
            <p className="text-sm text-gray-600 mt-1">
              Serial Number: {battery.serial}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSaving}
              required
            >
              <option value="charging">Charging</option>
              <option value="full">Full</option>
              <option value="faulty">Faulty</option>
              <option value="in-use">In-use</option>
              <option value="idle">Idle</option>
            </select>
          </div>

          {/* SOH */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SOH (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={soh}
              onChange={(e) => setSoh(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0-100"
              disabled={isSaving}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a value from 0 to 100
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

