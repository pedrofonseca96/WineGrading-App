'use client'

import { useActionState } from 'react'
import { createEvent } from '@/app/actions/event'
import Link from 'next/link'

export default function CreateEventPage() {
    const [state, action, pending] = useActionState(createEvent, undefined)

    return (
        <div className="min-h-screen flex items-center justify-center text-stone-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-stone-800 rounded-xl shadow-2xl border border-stone-700">
                <div className="text-center">
                    <h1 className="text-3xl font-serif font-bold text-amber-500">New Tasting</h1>
                    <p className="mt-2 text-stone-400">Create a new wine grading event</p>
                </div>

                <form action={action} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-stone-300">
                            Event Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="e.g., Sunday Lunch, Christmas Dinner"
                            required
                            className="mt-1 block w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded-md text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {state?.errors?.name && (
                            <p className="mt-1 text-sm text-red-500">{state.errors.name}</p>
                        )}
                    </div>

                    <div className="flex gap-4 pt-2">
                        <Link
                            href="/dashboard"
                            className="flex-1 py-2 px-4 border border-stone-600 rounded-md text-sm font-medium text-stone-300 hover:bg-stone-700 hover:text-white text-center transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={pending}
                            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-stone-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {pending ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
