'use client'

import { useState, useEffect, useTransition } from 'react'
import { submitGrade, nextWine, previousWine, finishEvent } from '@/app/actions/grading'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

export default function EventClient({
    event,
    userId,
    initialGrade,
}: {
    event: EventData
    userId: string
    initialGrade: GradeData
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [grade, setGrade] = useState(initialGrade || { colorScore: 0, smellScore: 0, tasteScore: 0 })
    const [submitted, setSubmitted] = useState(!!initialGrade)

    // Poll for updates every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh()
        }, 5000)
        return () => clearInterval(interval)
    }, [router])

    // Reset local state when wine changes
    useEffect(() => {
        setGrade(initialGrade || { colorScore: 0, smellScore: 0, tasteScore: 0 })
        setSubmitted(!!initialGrade)
    }, [event.currentWineOrder, initialGrade])

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
        return formData
    }

    const isAdmin = userId === event.creatorId
    console.log('EventClient Debug:', { userId, creatorId: event.creatorId, isAdmin, eventStatus: event.status })

    if (event.status === 'finished') {
        return (
            <div className="text-center py-12">
                <h2 className="text-3xl font-serif text-amber-500 mb-4">Tasting Finished!</h2>
                <p className="text-stone-400 mb-8">The results are being tallied.</p>
                <Link
                    href={`/event/${event.id}/results`}
                    className="inline-block px-6 py-3 bg-amber-600 text-stone-900 font-bold rounded-full hover:bg-amber-500 transition-colors"
                >
                    Go to Results
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-stone-800 text-amber-500 text-sm font-medium mb-4 border border-stone-700">
                    Wine #{event.currentWineOrder}
                </span>
                <h2 className="text-4xl font-serif font-bold text-stone-100">Tasting in Progress</h2>
                <div className="text-xs text-stone-500 mt-2">
                    Debug: User={userId} | Creator={event.creatorId} | IsAdmin={isAdmin ? 'Yes' : 'No'}
                </div>
            </div>

            <div className="bg-stone-800 p-8 rounded-2xl shadow-xl border border-stone-700">
                <div className="space-y-8">
                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-3 uppercase tracking-wider">Color (1-3)</label>
                        <div className="flex justify-between gap-2">
                            {[1, 2, 3].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleGradeChange('colorScore', val)}
                                    disabled={submitted}
                                    className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${grade!.colorScore === val
                                        ? 'bg-amber-600 text-stone-900 shadow-lg scale-105'
                                        : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                                        } ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Smell */}
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-3 uppercase tracking-wider">Smell (1-7)</label>
                        <div className="grid grid-cols-7 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleGradeChange('smellScore', val)}
                                    disabled={submitted}
                                    className={`py-3 rounded-lg font-bold text-lg transition-all ${grade!.smellScore === val
                                        ? 'bg-amber-600 text-stone-900 shadow-lg scale-105'
                                        : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                                        } ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Taste */}
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-3 uppercase tracking-wider">Taste (1-10)</label>
                        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleGradeChange('tasteScore', val)}
                                    disabled={submitted}
                                    className={`py-3 rounded-lg font-bold text-lg transition-all ${grade!.tasteScore === val
                                        ? 'bg-amber-600 text-stone-900 shadow-lg scale-105'
                                        : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                                        } ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={submitted || isPending || grade!.colorScore === 0 || grade!.smellScore === 0 || grade!.tasteScore === 0}
                            className="w-full py-4 bg-amber-500 text-stone-900 font-bold rounded-xl shadow-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                        >
                            {submitted ? 'Grade Submitted' : isPending ? 'Submitting...' : 'Submit Grade'}
                        </button>
                    </div>
                </div>
            </div>

            {isAdmin && (
                <div className="border-t border-stone-800 pt-8 mt-12">
                    <h3 className="text-stone-500 text-sm font-medium uppercase tracking-wider mb-4 text-center">Admin Controls</h3>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => startTransition(() => previousWine(event.id))}
                            disabled={event.currentWineOrder <= 1}
                            className="px-4 py-2 bg-stone-800 text-stone-400 rounded-lg hover:bg-stone-700 disabled:opacity-50"
                        >
                            Previous Wine
                        </button>
                        <button
                            onClick={() => startTransition(() => nextWine(event.id))}
                            className="px-4 py-2 bg-stone-800 text-amber-500 rounded-lg hover:bg-stone-700 border border-amber-500/30"
                        >
                            Next Wine
                        </button>
                        <button
                            onClick={() => startTransition(() => finishEvent(event.id))}
                            className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 border border-red-900/50"
                        >
                            Finish Event
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
