'use client'

import { useActionState } from 'react'
import { register } from '@/app/actions/auth'
import Link from 'next/link'

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

    return (
        <div className="min-h-screen flex items-center justify-center text-stone-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-stone-800 rounded-xl shadow-2xl border border-stone-700">
                <div className="text-center">
                    <h1 className="text-3xl font-serif font-bold text-amber-500">Join the Table</h1>
                    <p className="mt-2 text-stone-400">Create your account</p>
                </div>

                <form action={action} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-stone-300">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded-md text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {state?.errors?.username && (
                            <p className="mt-1 text-sm text-red-500">{state.errors.username}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-stone-300">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 block w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded-md text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {state?.errors?.password && (
                            <p className="mt-1 text-sm text-red-500">{state.errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-stone-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {pending ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <div className="text-center text-sm text-stone-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-amber-500 hover:text-amber-400">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
