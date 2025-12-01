'use client'

import { useActionState } from 'react'
import { register } from '@/app/actions/auth'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type ActionState = {
    errors?: {
        username?: string[]
        password?: string[]
        root?: string[]
        [key: string]: string[] | undefined
    }
}

export default function RegisterPage() {
    const [state, action, pending] = useActionState<ActionState, FormData>(register, {})
    const { t } = useLanguage()

    return (
        <div className="min-h-screen flex items-center justify-center text-stone-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-stone-800 rounded-xl shadow-2xl border border-stone-700">
                <div className="text-center">
                    <h1 className="text-3xl font-serif font-bold text-amber-500">Junior Rocketeers</h1>
                    <p className="mt-2 text-stone-400">{t.auth.registerTitle}</p>
                </div>

                <form action={action} className="space-y-4">
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        label={t.auth.username}
                        required
                        error={state?.errors?.username}
                    />

                    <Input
                        id="password"
                        name="password"
                        type="password"
                        label={t.auth.password}
                        required
                        error={state?.errors?.password}
                    />

                    <Button
                        type="submit"
                        isLoading={pending}
                        loadingText={`${t.auth.registerButton}...`}
                    >
                        {t.auth.registerButton}
                    </Button>
                </form>

                <div className="text-center text-sm text-stone-400">
                    {t.auth.alreadyHaveAccount}{' '}
                    <Link href="/login" className="font-medium text-amber-500 hover:text-amber-400">
                        {t.auth.loginHere}
                    </Link>
                </div>
            </div>
        </div>
    )
}
