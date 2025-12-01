import React, { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string[] | string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-stone-300">
                    {label}
                </label>
                <input
                    id={id}
                    ref={ref}
                    className={`mt-1 block w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded-md text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">
                        {Array.isArray(error) ? error[0] : error}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
