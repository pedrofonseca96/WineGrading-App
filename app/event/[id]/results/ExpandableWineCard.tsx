'use client'

import { useState } from 'react'
import { getWineGradeBreakdown } from '@/app/actions/breakdown'
import { useLanguage } from '@/contexts/LanguageContext'

type GradeBreakdown = {
    userId: string
    username: string
    colorScore: number
    smellScore: number
    tasteScore: number
    totalScore: number
}

type WineCardProps = {
    result: {
        order: number
        totalScore: number
        colorScore: number
        smellScore: number
        tasteScore: number
        count: number
        wine?: {
            name: string | null
            description: string | null
            imageUrl: string | null
        }
    }
    index: number
    eventId: string
    isAdmin: boolean
    children: React.ReactNode
}

export default function ExpandableWineCard({ result, index, eventId, isAdmin, children }: WineCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [breakdown, setBreakdown] = useState<GradeBreakdown[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { t } = useLanguage()

    const handleToggle = async () => {
        if (!isExpanded && breakdown.length === 0) {
            setIsLoading(true)
            const data = await getWineGradeBreakdown(eventId, result.order)
            setBreakdown(data)
            setIsLoading(false)
        }
        setIsExpanded(!isExpanded)
    }

    return (
        <div className="bg-stone-800 rounded-xl border border-stone-700 overflow-hidden">
            {/* Main Card - Clickable */}
            <div
                onClick={handleToggle}
                className="cursor-pointer hover:bg-stone-750 transition-colors"
            >
                <div className="p-4 sm:p-6">
                    {/* Mobile: Row with Rank, Wine Name, Score all inline */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Wine Image - Only show to non-admin users */}
                        {!isAdmin && result.wine?.imageUrl && (
                            <div className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 overflow-hidden rounded-lg border-2 border-stone-600">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={result.wine.imageUrl}
                                    alt={result.wine.name || `Wine #${result.order}`}
                                    className="w-full h-full max-w-full max-h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Rank Badge */}
                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-700 text-amber-500 font-bold text-lg sm:text-xl border border-stone-600">
                            #{index + 1}
                        </div>

                        {/* Wine Details - grows to fill space */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-2xl font-serif font-bold text-stone-100 truncate">
                                {result.wine?.name || `Wine #${result.order}`}
                            </h3>
                            <p className="text-stone-400 text-xs sm:text-sm truncate hidden sm:block">
                                {result.wine?.description || 'No description added'}
                            </p>
                        </div>

                        {/* Score & Expand Icon - always on the right */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <div className="text-right">
                                <div className="text-2xl sm:text-4xl font-bold text-amber-500">{result.totalScore}</div>
                                <div className="text-stone-500 text-xs uppercase tracking-wider hidden sm:block">Total Score</div>
                            </div>
                            <div className="text-stone-400">
                                <svg
                                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breakdown Summary */}
                <div className="bg-stone-850 px-6 py-4 border-t border-stone-700 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-lg font-semibold text-stone-300">{result.colorScore}</div>
                        <div className="text-stone-500 text-xs">{t.event.color}</div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-stone-300">{result.smellScore}</div>
                        <div className="text-stone-500 text-xs">{t.event.smell}</div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-stone-300">{result.tasteScore}</div>
                        <div className="text-stone-500 text-xs">{t.event.taste}</div>
                    </div>
                </div>
            </div>

            {/* Expanded Breakdown Table */}
            {isExpanded && (
                <div className="border-t border-stone-700 bg-stone-900/50 p-6" onClick={(e) => e.stopPropagation()}>
                    {isLoading ? (
                        <div className="text-center text-stone-400 py-4">{t.results.loadingBreakdown}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-700">
                                        <th className="text-center py-3 px-4 text-stone-400 font-medium">{t.results.user}</th>
                                        <th className="text-center py-3 px-4 text-stone-400 font-medium">{t.event.color}</th>
                                        <th className="text-center py-3 px-4 text-stone-400 font-medium">{t.event.smell}</th>
                                        <th className="text-center py-3 px-4 text-stone-400 font-medium">{t.event.taste}</th>
                                        <th className="text-center py-3 px-4 text-stone-400 font-medium">{t.results.total}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakdown.map((grade, idx) => (
                                        <tr key={idx} className="border-b border-stone-800 hover:bg-stone-800/50">
                                            <td className="text-center py-3 px-4 text-stone-300">
                                                {grade.username}
                                            </td>
                                            <td className="text-center py-3 px-4 text-stone-200">{grade.colorScore}</td>
                                            <td className="text-center py-3 px-4 text-stone-200">{grade.smellScore}</td>
                                            <td className="text-center py-3 px-4 text-stone-200">{grade.tasteScore}</td>
                                            <td className="text-center py-3 px-4 text-amber-500 font-semibold">{grade.totalScore}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Admin Edit Form */}
            {children}
        </div>
    )
}
