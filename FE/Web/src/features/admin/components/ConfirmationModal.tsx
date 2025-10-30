import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogPortal } from '@/components/ui/dialog';
import { AlertTriangle, Edit, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

type ConfirmationVariant = 'delete' | 'edit' | 'default';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | React.ReactNode;
    confirmText: string;
    cancelText?: string;
    // Backwards-compat: accept both "type" and "variant"
    type?: ConfirmationVariant;
    variant?: ConfirmationVariant;
    isLoading?: boolean;
    showWarning?: boolean; // if true shows warning strip for delete variant
    warningText?: string;  // custom warning text
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText = 'Cancel',
    type,
    variant,
    isLoading = false,
    showWarning,
    warningText
}) => {
    const resolvedVariant: ConfirmationVariant = variant || type || 'default';

    const getConfirmButtonStyle = () => {
        switch (resolvedVariant) {
            case 'delete':
                return 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700';
            case 'edit':
                return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700';
            default:
                return 'bg-slate-700 hover:bg-slate-800 text-white border-slate-700 hover:border-slate-800';
        }
    };

    const shouldShowWarning = (showWarning ?? (resolvedVariant === 'delete'));
    const resolvedWarningText = warningText || 'By deleting this, the user will no longer be able to access this.';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogPortal>
                {/* Overlay */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-[9998] bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[9999] grid w-full max-w-xl -translate-x-1/2 -translate-y-1/2 gap-5 rounded-xl border bg-white p-8 shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                    <DialogHeader className="pb-2">
                        <div className="w-full flex flex-col items-center gap-2">
                            {resolvedVariant === 'delete' ? (
                                <div className="h-16 w-16 rounded-full border-2 border-red-500 flex items-center justify-center">
                                    <X className="h-8 w-8 text-red-500" />
                                </div>
                            ) : resolvedVariant === 'edit' ? (
                                <Edit className="h-10 w-10 text-blue-600" />
                            ) : (
                                <AlertTriangle className="h-10 w-10 text-amber-600" />
                            )}
                            <DialogTitle className="text-2xl font-extrabold text-slate-900 text-center uppercase tracking-wide">
                                {title}
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-slate-800 text-lg font-medium justify-center text-center">
                            {message}
                        </div>

                        {shouldShowWarning && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-amber-700">Warning</div>
                                    <div className="text-amber-800 text-sm leading-relaxed">{resolvedWarningText}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex justify-between pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-5 h-10 bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 hover:border-slate-300 rounded-lg disabled:opacity-50"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-5 h-10 rounded-lg transition-all ${getConfirmButtonStyle()} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
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
