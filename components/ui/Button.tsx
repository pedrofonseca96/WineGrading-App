import React, { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean
    loadingText?: string
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, isLoading, loadingText, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-stone-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
                {...props}
            >
                {isLoading ? (loadingText || 'Loading...') : children}
            </button>
        )
    }
)

Button.displayName = 'Button'
