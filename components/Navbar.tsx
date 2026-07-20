'use client'

import Link from 'next/link'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/contexts/LanguageContext'
import { logout } from '@/app/actions/logout'

type NavbarProps = {
    title?: string
    showBackToDashboard?: boolean
    showLogout?: boolean
}

export default function Navbar({
    title,
    showBackToDashboard = true,
    showLogout = true,
}: NavbarProps) {
    const { t } = useLanguage()

    return (
        <header className="w-full bg-stone-900/80 backdrop-blur-md border-b border-stone-800 sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                {/* Brand & Optional View Title */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="text-xl sm:text-2xl font-serif font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-2"
                    >
                        <span>🍷</span>
                        <span>Junior Rocketeers</span>
                    </Link>

                    {title && (
                        <>
                            <span className="text-stone-600 hidden sm:inline">|</span>
                            <span className="text-stone-300 font-medium text-sm sm:text-base truncate max-w-[200px] sm:max-w-xs">
                                {title}
                            </span>
                        </>
                    )}
                </div>

                {/* Navigation Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {showBackToDashboard && (
                        <Link
                            href="/dashboard"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-750 border border-stone-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            <span>{t.nav.backToDashboard}</span>
                        </Link>
                    )}

                    <LanguageToggle />

                    {showLogout && (
                        <form action={logout}>
                            <button
                                type="submit"
                                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-400 hover:text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg border border-stone-700 transition-colors"
                            >
                                {t.auth.logout}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </header>
    )
}
