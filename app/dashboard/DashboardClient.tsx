'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { logout } from '@/app/actions/logout'

type DashboardClientProps = {
    events: Array<{
        id: string
        name: string
        date: Date
        status: string
    }>
}

export default function DashboardClient({ events }: DashboardClientProps) {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen text-stone-100 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-amber-500">Junior Rocketeers</h1>
                        <p className="text-stone-400 mt-1 sm:mt-2 text-sm sm:text-base">{t.dashboard.title}</p>
                    </div>
                    <div className="flex flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                        <form action={logout} className="flex-1 sm:flex-none">
                            <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-stone-400 hover:text-white transition-colors bg-stone-800 sm:bg-transparent rounded-lg sm:rounded-none">
                                {t.auth.logout}
                            </button>
                        </form>
                        <Link
                            href="/event/create"
                            className="flex-1 sm:flex-none text-center px-4 py-2 bg-amber-600 text-stone-900 font-medium rounded-lg sm:rounded-md hover:bg-amber-500 transition-colors"
                        >
                            {t.dashboard.createEvent}
                        </Link>
                    </div>
                </header>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-6 text-stone-200">{t.dashboard.myEvents}</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                href={`/event/${event.id}`}
                                className="block p-6 bg-stone-800 rounded-xl border border-stone-700 hover:border-amber-500/50 hover:bg-stone-750 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-medium text-stone-100 group-hover:text-amber-500 transition-colors">
                                            {event.name}
                                        </h3>
                                        <p className="text-stone-400 text-sm mt-1">
                                            {new Date(event.date).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${event.status === 'active'
                                            ? 'bg-green-900/30 text-green-400 border border-green-800'
                                            : 'bg-stone-700 text-stone-400'
                                            }`}
                                    >
                                        {event.status}
                                    </span>
                                </div>
                            </Link>
                        ))}

                        {events.length === 0 && (
                            <div className="col-span-full text-center py-12 border-2 border-dashed border-stone-700 rounded-xl">
                                <p className="text-stone-500">{t.dashboard.noEvents}</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
