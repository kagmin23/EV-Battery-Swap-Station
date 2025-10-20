import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogPortal } from '@/components/ui/dialog';
import { AlertTriangle, Trash2, Edit } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | React.ReactNode;
    confirmText: string;
    cancelText?: string;
    type: 'delete' | 'edit';
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText = 'Hủy',
    type,
    isLoading = false
}) => {
    const getIcon = () => {
        switch (type) {
            case 'delete':
                return <Trash2 className="h-6 w-6 text-red-500" />;
            case 'edit':
                return <Edit className="h-6 w-6 text-blue-500" />;
            default:
                return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
        }
    };

    const getConfirmButtonStyle = () => {
        switch (type) {
            case 'delete':
                return 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700';
            case 'edit':
                return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700';
            default:
                return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogPortal>
                {/* Custom overlay with darker backdrop */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-[9998] bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold text-slate-800 text-center">
                            {title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-2">
                        <div className="text-slate-600 leading-relaxed text-center">
                            {message}
                        </div>
                    </div>

                    <DialogFooter className="flex justify-center space-x-3 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-2 h-10 bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300 rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-6 py-2 h-10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonStyle()}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang xử lý...
                                </div>
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </DialogFooter>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
};
