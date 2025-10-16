import React from 'react'
import { Spinner } from './spinner'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'default' | 'white' | 'gray' | 'success' | 'warning' | 'error'
    text?: string
    className?: string
    fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    variant = 'default',
    text = 'Đang tải...',
    className,
    fullScreen = false
}) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center space-y-4">
                    <Spinner size={size} variant={variant} />
                    {text && (
                        <p className="text-sm text-gray-600 font-medium">{text}</p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className={cn("flex items-center justify-center py-12", className)}>
            <div className="flex flex-col items-center space-y-4">
                <Spinner size={size} variant={variant} />
                {text && (
                    <p className="text-sm text-gray-600 font-medium">{text}</p>
                )}
            </div>
        </div>
    )
}

// Page Loading Component
export const PageLoadingSpinner: React.FC<{
    text?: string
    className?: string
}> = ({ text = 'Đang tải trang...', className }) => {
    return (
        <div className={cn("min-h-[400px] flex items-center justify-center", className)}>
            <div className="flex flex-col items-center space-y-4">
                <Spinner size="lg" variant="default" />
                <p className="text-lg text-gray-600 font-medium">{text}</p>
            </div>
        </div>
    )
}

// Button Loading Component
export const ButtonLoadingSpinner: React.FC<{
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'white' | 'gray' | 'success' | 'warning' | 'error'
    text?: string
    className?: string
}> = ({ size = 'sm', variant = 'white', text, className }) => {
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Spinner size={size} variant={variant} />
            {text && (
                <span className="text-sm font-medium">{text}</span>
            )}
        </div>
    )
}

// Card Loading Component
export const CardLoadingSpinner: React.FC<{
    text?: string
    className?: string
}> = ({ text = 'Đang tải dữ liệu...', className }) => {
    return (
        <div className={cn("flex items-center justify-center py-8", className)}>
            <div className="flex flex-col items-center space-y-3">
                <Spinner size="md" variant="default" />
                <p className="text-sm text-gray-500">{text}</p>
            </div>
        </div>
    )
}
