'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
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

export default function LoginPage() {
    const [state, action, pending] = useActionState<ActionState, FormData>(login, {})
    const { t } = useLanguage()

    return (
        <div className="min-h-screen flex items-center justify-center text-stone-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-stone-800 rounded-xl shadow-2xl border border-stone-700">
                <div className="text-center">
                    <h1 className="text-3xl font-serif font-bold text-amber-500">Junior Rocketeers</h1>
                    <p className="mt-2 text-stone-400">{t.auth.loginTitle}</p>
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

                    {state?.errors?.root && (
                        <p className="text-sm text-red-500 text-center">{state.errors.root}</p>
                    )}

                    <Button
                        type="submit"
                        isLoading={pending}
                        loadingText={`${t.auth.loginButton}...`}
                    >
                        {t.auth.loginButton}
                    </Button>
                </form>

                <div className="text-center text-sm text-stone-400">
                    {t.auth.dontHaveAccount}{' '}
                    <Link href="/register" className="font-medium text-amber-500 hover:text-amber-400">
                        {t.auth.registerHere}
                    </Link>
                </div>
            </div>
        </div>
    )
}
