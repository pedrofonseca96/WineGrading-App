'use client'

import { useState, useEffect, useTransition } from 'react'
import { submitGrade, nextWine, previousWine, finishEvent, getUserGrade } from '@/app/actions/grading'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useEventStream } from '@/hooks/useEventStream'

type EventData = {
    id: string
    name: string
    status: string
    currentWineOrder: number
    creatorId: string
}

type GradeData = {
    colorScore: number
    smellScore: number
    tasteScore: number
} | null

type UserInfo = {
    id: string
    username: string
}

export default function EventClient({
    event,
    userId,
    userRole,
    initialGrade,
    users = [],
}: {
    event: EventData
    userId: string
    userRole: string
    initialGrade: GradeData
    users?: UserInfo[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [grade, setGrade] = useState(initialGrade || { colorScore: 0, smellScore: 0, tasteScore: 0 })
    const [submitted, setSubmitted] = useState(!!initialGrade)
    const [targetUserId, setTargetUserId] = useState(userId)
    const { t } = useLanguage()
    const eventState = useEventStream(event.id)

    // Update local state when server state changes
    useEffect(() => {
        if (eventState && eventState.currentWineOrder !== event.currentWineOrder) {
            router.refresh()
        }
    }, [eventState, event.currentWineOrder, router])

    // Reset local state when wine changes
    useEffect(() => {
        setGrade(initialGrade || { colorScore: 0, smellScore: 0, tasteScore: 0 })
        setSubmitted(!!initialGrade)
        setTargetUserId(userId) // Reset to yourself when wine changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event.currentWineOrder])

    // Load grade when target user changes (for Super User corrections)
    useEffect(() => {
        if (targetUserId === userId) {
            setGrade(initialGrade || { colorScore: 0, smellScore: 0, tasteScore: 0 })
            setSubmitted(!!initialGrade)
            return
        }

        const loadUserGrade = async () => {
            const userGrade = await getUserGrade(event.id, event.currentWineOrder, targetUserId)
            setGrade(userGrade || { colorScore: 0, smellScore: 0, tasteScore: 0 })
            setSubmitted(!!userGrade)
        }

        loadUserGrade()
    }, [targetUserId, event.id, event.currentWineOrder, userId, initialGrade])

    const handleGradeChange = (field: keyof typeof grade, value: number) => {
        setGrade((prev) => ({ ...prev!, [field]: value }))
    }

    const handleSubmit = async () => {
        if (grade!.colorScore === 0 || grade!.smellScore === 0 || grade!.tasteScore === 0) return

        startTransition(async () => {
            await submitGrade(null, createFormData(grade!))
            setSubmitted(true)
        })
    }

    const createFormData = (data: typeof grade) => {
        const formData = new FormData()
        formData.append('eventId', event.id)
        formData.append('wineOrder', event.currentWineOrder.toString())
        formData.append('colorScore', data!.colorScore.toString())
        formData.append('smellScore', data!.smellScore.toString())
        formData.append('tasteScore', data!.tasteScore.toString())
        if (targetUserId !== userId) {
            formData.append('targetUserId', targetUserId)
        }
        return formData
    }

    const isAdmin = userId === event.creatorId
    const isSuperUser = userRole === 'SUPER_USER'


    if (event.status === 'finished' && !isSuperUser) {
        return (
            <div className="text-center py-12">
                <h2 className="text-3xl font-serif text-amber-500 mb-4">{t.event.eventFinished}</h2>
                <p className="text-stone-400 mb-8">{t.event.resultsBeingTallied}</p>
                <Link
                    href={`/event/${event.id}/results`}
                    className="inline-block px-6 py-3 bg-amber-600 text-stone-900 font-bold rounded-full hover:bg-amber-500 transition-colors"
                >
                    {t.event.goToResults}
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-stone-800 text-amber-500 text-sm font-medium mb-4 border border-stone-700">
                    {t.event.wineNumber}{event.currentWineOrder}
                </span>
                <h2 className="text-4xl font-serif font-bold text-stone-100">
                    {event.status === 'finished' ? 'Post-Event Correction' : 'Tasting in Progress'}
                </h2>
                <div className="text-xs text-stone-500 mt-2">
                    Debug: User={userId} | Creator={event.creatorId} | Role={userRole}
                </div>
            </div>

            {isSuperUser && users.length > 0 && (
                <div className="bg-stone-800 p-4 rounded-xl border border-amber-500/30">
                    <label className="block text-xs font-medium text-amber-500 uppercase tracking-wider mb-2">
                        Correcting grade for:
                    </label>
                    <select
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="w-full bg-stone-900 text-stone-100 border border-stone-700 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                    >
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.username} {u.id === userId ? '(Me)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="bg-stone-800 p-8 rounded-2xl shadow-xl border border-stone-700">
                <div className="space-y-8">
                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-3 uppercase tracking-wider">{t.event.color} (1-3)</label>
                        <div className="flex justify-between gap-2">
                            {[1, 2, 3].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleGradeChange('colorScore', val)}
                                    className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${grade!.colorScore === val
                                        ? 'bg-amber-600 text-stone-900 shadow-lg scale-105'
                                        : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                                        }`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Smell */}
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-3 uppercase tracking-wider">{t.event.smell} (1-7)</label>
                        <div className="grid grid-cols-7 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleGradeChange('smellScore', val)}
                                    className={`py-3 rounded-lg font-bold text-lg transition-all ${grade!.smellScore === val
                                        ? 'bg-amber-600 text-stone-900 shadow-lg scale-105'
                                        : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                                        }`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Taste */}
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-3 uppercase tracking-wider">{t.event.taste} (1-10)</label>
                        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleGradeChange('tasteScore', val)}
                                    className={`py-3 rounded-lg font-bold text-lg transition-all ${grade!.tasteScore === val
                                        ? 'bg-amber-600 text-stone-900 shadow-lg scale-105'
                                        : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                                        }`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isPending || grade!.colorScore === 0 || grade!.smellScore === 0 || grade!.tasteScore === 0}
                            className="w-full py-4 bg-amber-500 text-stone-900 font-bold rounded-xl shadow-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                        >
                            {isPending ? `${t.event.submitGrade}...` : submitted ? t.event.updateGrade : t.event.submitGrade}
                        </button>
                    </div>
                </div>
            </div>

            {(isAdmin || isSuperUser) && (
                <div className="border-t border-stone-800 pt-8 mt-12">
                    <h3 className="text-stone-500 text-sm font-medium uppercase tracking-wider mb-4 text-center">{t.admin.adminControls}</h3>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => startTransition(() => previousWine(event.id))}
                            disabled={event.currentWineOrder <= 1}
                            className="px-4 py-2 bg-stone-800 text-stone-400 rounded-lg hover:bg-stone-700 disabled:opacity-50"
                        >
                            {t.event.previousWine}
                        </button>
                        <button
                            onClick={() => startTransition(() => nextWine(event.id))}
                            className="px-4 py-2 bg-stone-800 text-amber-500 rounded-lg hover:bg-stone-700 border border-amber-500/30"
                        >
                            {t.event.nextWine}
                        </button>
                        <button
                            onClick={() => startTransition(() => finishEvent(event.id))}
                            className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 border border-red-900/50"
                        >
                            {t.event.finishEvent}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
