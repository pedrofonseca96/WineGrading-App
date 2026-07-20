'use client'

import { useActionState } from 'react'
import { createEvent } from '@/app/actions/event'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { Input } from '@/components/ui/Input'

type ActionState = {
    errors?: {
        name?: string[]
        root?: string[]
    }
} | undefined

export default function CreateEventPage() {
    const [state, action, pending] = useActionState<ActionState, FormData>(createEvent, undefined)
    const { t } = useLanguage()

    return (
        <div className="min-h-screen flex items-center justify-center text-stone-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-stone-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-stone-700">
                <div className="text-center">
                    <h1 className="text-3xl font-serif font-bold text-amber-500">{t.eventCreate.title}</h1>
                    <p className="mt-2 text-stone-400 text-sm sm:text-base">{t.eventCreate.subtitle}</p>
                </div>

                <form action={action} className="space-y-4">
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        label={t.eventCreate.eventName}
                        placeholder={t.eventCreate.placeholder}
                        required
                        error={state?.errors?.name}
                    />

                    <div className="flex gap-4 pt-4">
                        <Link
                            href="/dashboard"
                            className="flex-1 py-2.5 px-4 border border-stone-600 rounded-md text-sm font-medium text-stone-300 hover:bg-stone-700 hover:text-white text-center transition-colors"
                        >
                            {t.eventCreate.cancel}
                        </Link>
                        <button
                            type="submit"
                            disabled={pending}
                            className="flex-1 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-stone-900 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {pending ? t.eventCreate.creating : t.eventCreate.createEvent}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
