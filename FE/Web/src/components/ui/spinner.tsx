import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
    "animate-spin rounded-full border-2 border-current border-t-transparent",
    {
        variants: {
            size: {
                sm: "h-4 w-4",
                md: "h-6 w-6",
                lg: "h-8 w-8",
                xl: "h-12 w-12",
            },
            variant: {
                default: "text-blue-600",
                white: "text-white",
                gray: "text-gray-600",
                success: "text-green-600",
                warning: "text-yellow-600",
                error: "text-red-600",
            },
        },
        defaultVariants: {
            size: "md",
            variant: "default",
        },
    }
)

export interface SpinnerProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
    label?: string
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
    ({ className, size, variant, label, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("flex items-center justify-center", className)}
                {...props}
            >
                <div
                    className={spinnerVariants({ size, variant })}
                    role="status"
                    aria-label={label || "Loading"}
                >
                    <span className="sr-only">{label || "Loading"}</span>
                </div>
            </div>
        )
    }
)
Spinner.displayName = "Spinner"

export { Spinner, spinnerVariants }
