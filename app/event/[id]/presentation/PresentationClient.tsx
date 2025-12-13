'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { updateRevealCount, getPresentationState, finishPresentation, updateBroughtBy } from '@/app/actions/presentation'
import { getWineDetails } from '@/app/actions/wine'
import { useLanguage } from '@/contexts/LanguageContext'

import Scorecard from '../results/Scorecard'

type Result = {
    order: number
    totalScore: number
    colorScore: number
    smellScore: number
    tasteScore: number
    wine?: {
        name: string | null
        description: string | null
        imageUrl: string | null
        broughtBy: string | null
    }
}

interface PresentationClientProps {
    results: Result[]
    eventId: string
    isCreator: boolean
    initialRevealCount: number
    users: { id: string; username: string }[]
    grades: { userId: string; wineOrder: number; totalScore: number }[]
}

export default function PresentationClient({ results, eventId, isCreator, initialRevealCount, users, grades }: PresentationClientProps) {
    // Sort results by score ascending (lowest to highest)
    const sortedResults = [...results].sort((a, b) => a.totalScore - b.totalScore)

    const [revealedCount, setRevealedCount] = useState(initialRevealCount)
    const [currentWineDetails, setCurrentWineDetails] = useState<Result['wine'] | null>(null)
    const [showBroughtBy, setShowBroughtBy] = useState(false)
    const { t } = useLanguage()

    // Reset showBroughtBy when moving to next wine
    // Reset showBroughtBy when moving to next wine
    const [prevRevealCount, setPrevRevealCount] = useState(revealedCount)
    if (revealedCount !== prevRevealCount) {
        setPrevRevealCount(revealedCount)
        setShowBroughtBy(false)
    }

    // Polling for presentation state (reveal count)
    useEffect(() => {
        if (isCreator) return

        const interval = setInterval(async () => {
            const state = await getPresentationState(eventId)
            if (state && state.presentationRevealCount !== revealedCount) {
                setRevealedCount(state.presentationRevealCount)
            }
        }, 2000)

        return () => clearInterval(interval)
    }, [eventId, isCreator, revealedCount])

    // If revealedCount is 0, we are in "start" mode (blank screen)
    // If revealedCount is 1, we show the first wine (index 0)
    const currentRevealIndex = revealedCount - 1
    const currentReveal = currentRevealIndex >= 0 && currentRevealIndex < sortedResults.length ? sortedResults[currentRevealIndex] : null
    const isFinished = revealedCount > sortedResults.length

    // Poll for current wine details (image, name, description)
    useEffect(() => {
        if (!currentReveal) return

        const fetchDetails = async () => {
            const details = await getWineDetails(eventId, currentReveal.order)
            if (details) {
                setCurrentWineDetails(details)
            }
        }

        // Initial fetch when reveal changes
        fetchDetails()

        // Poll for updates (e.g. if admin adds image live)
        const interval = setInterval(fetchDetails, 2000)

        return () => clearInterval(interval)
    }, [eventId, currentReveal]) // Re-run when current wine changes

    // Use local state if available, otherwise fall back to prop data (though prop data might be stale)
    const displayWine = currentWineDetails || currentReveal?.wine

    // Calculate rank (reverse index)
    const getRank = (index: number) => sortedResults.length - (index - 1)

    const handleNext = async () => {
        if (revealedCount <= sortedResults.length) {
            const newCount = revealedCount + 1
            setRevealedCount(newCount) // Optimistic update
            await updateRevealCount(eventId, newCount)
        }
    }

    return (
        <div className="min-h-screen text-stone-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-stone-950 to-stone-950 pointer-events-none" />

            <div className="z-10 w-full max-w-5xl space-y-12 text-center">
                {!isFinished && !currentReveal && (
                    <div className="animate-in fade-in zoom-in duration-1000 flex flex-col items-center justify-center h-[60vh]">
                        <h1 className="text-6xl md:text-8xl font-serif font-bold text-amber-500 mb-8 animate-pulse">
                            {t.presentation.readyToReveal}
                        </h1>
                        <p className="text-2xl text-stone-400 italic">
                            {t.presentation.waitingForAdmin}
                        </p>
                    </div>
                )}

                {!isFinished && currentReveal && (
                    <div key={currentReveal.order} className="animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10 fill-mode-forwards">
                        <div className="mb-4 text-amber-500 font-serif text-2xl tracking-widest uppercase animate-in fade-in slide-in-from-top-4 duration-700 delay-100 fill-mode-forwards">
                            {t.presentation.rank}{getRank(revealedCount)}
                        </div>

                        <div className="bg-stone-900/80 backdrop-blur-md p-12 rounded-3xl border border-amber-500/30 shadow-2xl shadow-amber-900/20 animate-in fade-in zoom-in-95 duration-700 delay-200 fill-mode-forwards">
                            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 font-serif animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-forwards">
                                {displayWine?.name || `${t.event.wineNumber}${currentReveal.order}`}
                            </h1>

                            {displayWine?.imageUrl && (
                                <div className="mb-8 relative w-48 h-72 mx-auto shadow-2xl rounded-lg overflow-hidden border-2 border-stone-800 animate-in fade-in zoom-in duration-1000 delay-500 fill-mode-forwards">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={displayWine.imageUrl}
                                        alt={displayWine.name || 'Wine'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <p className="text-2xl text-stone-400 mb-8 italic animate-in fade-in slide-in-from-bottom-2 duration-700 delay-700 fill-mode-forwards">
                                {displayWine?.description || t.presentation.mysteryWine}
                            </p>

                            {/* Brought By Section */}
                            <div className="mb-12 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-900 fill-mode-forwards min-h-[5rem] flex flex-col items-center justify-center gap-3">
                                <span className="text-stone-500 uppercase text-sm tracking-widest">{t.presentation.broughtBy}</span>

                                {displayWine?.broughtBy ? (
                                    // If name exists, show Reveal/Name logic
                                    showBroughtBy ? (
                                        <span className="text-amber-400 font-bold text-3xl animate-in fade-in zoom-in duration-300 font-serif">
                                            {displayWine.broughtBy}
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setShowBroughtBy(true)}
                                            className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-medium rounded-full transition-all border border-stone-700 hover:border-amber-500/50 hover:text-amber-500"
                                        >
                                            {t.presentation.reveal}
                                        </button>
                                    )
                                ) : isCreator ? (
                                    // If name missing and is admin, show Input
                                    <form
                                        action={async (formData) => {
                                            await updateBroughtBy(eventId, currentReveal.order, formData.get('broughtBy') as string)
                                        }}
                                        className="flex items-center gap-6 bg-stone-900/50 p-3 rounded-xl border border-stone-800"
                                    >
                                        <select
                                            name="broughtBy"
                                            defaultValue=""
                                            className="bg-stone-900 border border-stone-700 text-stone-200 focus:ring-amber-500 focus:border-amber-500 text-lg px-4 py-2 rounded-lg w-64 text-center font-serif appearance-none cursor-pointer"
                                            autoFocus
                                        >
                                            <option value="" disabled>Who brought this?</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.username}>{user.username}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="submit"
                                            className="bg-amber-600 hover:bg-amber-500 text-stone-900 text-sm font-bold px-6 py-2 rounded-lg transition-colors shadow-lg shadow-amber-900/20"
                                        >
                                            Save
                                        </button>
                                    </form>
                                ) : (
                                    // If name missing and not admin
                                    <span className="text-stone-600 italic text-lg">???</span>
                                )}
                            </div>

                            <div className="flex justify-center items-end gap-4 animate-in fade-in zoom-in duration-700 delay-1000 fill-mode-forwards">
                                <div className="text-9xl font-bold text-amber-500 leading-none">
                                    {currentReveal.totalScore}
                                </div>
                                <div className="text-xl text-stone-500 font-medium mb-4">{t.presentation.points}</div>
                            </div>

                            <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto border-t border-stone-800 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1200 fill-mode-forwards">
                                <div>
                                    <div className="text-3xl font-bold text-stone-300">{currentReveal.colorScore}</div>
                                    <div className="text-stone-500 uppercase text-sm tracking-wider mt-1">{t.event.color}</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-stone-300">{currentReveal.smellScore}</div>
                                    <div className="text-stone-500 uppercase text-sm tracking-wider mt-1">{t.event.smell}</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-stone-300">{currentReveal.tasteScore}</div>
                                    <div className="text-stone-500 uppercase text-sm tracking-wider mt-1">{t.event.taste}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isFinished && (
                    <div className="text-center animate-in fade-in zoom-in duration-1000 space-y-6 w-full max-w-6xl mx-auto">
                        <h1 className="text-6xl font-serif font-bold text-amber-500 mb-8">{t.presentation.tastingComplete}</h1>

                        <div className="mb-12">
                            <Scorecard
                                wines={results.map(r => ({
                                    order: r.order,
                                    name: r.wine?.name || null,
                                    broughtBy: r.wine?.broughtBy || null,
                                    totalScore: r.totalScore
                                }))}
                                users={users}
                                grades={grades}
                                isFinished={true}
                                revealedWineOrders={results.map(r => r.order)}
                            />
                        </div>

                        {isCreator ? (
                            <button
                                onClick={async () => {
                                    await finishPresentation(eventId)
                                    window.location.href = '/dashboard'
                                }}
                                className="inline-block px-8 py-4 bg-amber-600 text-stone-900 font-bold rounded-full hover:bg-amber-500 transition-colors shadow-lg"
                            >
                                {t.presentation.finishPresentation}
                            </button>
                        ) : (
                            <Link
                                href="/dashboard"
                                className="inline-block px-8 py-4 bg-stone-800 text-stone-300 rounded-full hover:bg-stone-700 transition-colors"
                            >
                                {t.presentation.returnToDashboard}
                            </Link>
                        )}
                    </div>
                )}

                {isCreator && (
                    <div className="fixed bottom-8 right-8 flex gap-4 z-50">
                        {!isFinished && (
                            <button
                                onClick={handleNext}
                                className="px-8 py-4 bg-amber-600 text-stone-900 font-bold rounded-full shadow-lg hover:bg-amber-500 transition-all transform hover:scale-105"
                            >
                                {t.presentation.revealNext}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
