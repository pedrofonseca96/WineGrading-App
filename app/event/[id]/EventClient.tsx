'use client'

import { useState, useEffect, useTransition, useRef, useCallback } from 'react'
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

    // Local wine navigation - users can navigate between 1 and maxWineOrder
    const [viewingWineOrder, setViewingWineOrder] = useState(event.currentWineOrder)
    const [maxWineOrder, setMaxWineOrder] = useState(event.currentWineOrder)
    const [showNewWineBanner, setShowNewWineBanner] = useState(false)
    const [isLoadingGrade, setIsLoadingGrade] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [confirmAction, setConfirmAction] = useState<'next' | 'previous' | null>(null)

    // Refs to access latest state in cleanup/beforeunload callbacks
    const gradeRef = useRef(grade)
    const hasUnsavedChangesRef = useRef(hasUnsavedChanges)
    const viewingWineOrderRef = useRef(viewingWineOrder)
    const targetUserIdRef = useRef(targetUserId)
    const prevTargetUserIdRef = useRef(targetUserId)

    useEffect(() => { gradeRef.current = grade }, [grade])
    useEffect(() => { hasUnsavedChangesRef.current = hasUnsavedChanges }, [hasUnsavedChanges])
    useEffect(() => { viewingWineOrderRef.current = viewingWineOrder }, [viewingWineOrder])
    useEffect(() => { targetUserIdRef.current = targetUserId }, [targetUserId])

    const isAdmin = userId === event.creatorId
    const isSuperUser = userRole === 'SUPER_USER'

    // Handle SSE updates - show banner instead of forcing navigation
    useEffect(() => {
        if (!eventState) return

        // If admin advanced to a new wine, update max and show banner (don't force navigation)
        if (eventState.currentWineOrder > maxWineOrder) {
            setMaxWineOrder(eventState.currentWineOrder)
            // Only show banner if user is not already viewing the latest wine
            if (viewingWineOrder < eventState.currentWineOrder) {
                setShowNewWineBanner(true)
            }
        }

        // If admin went back (rare), update max
        if (eventState.currentWineOrder < maxWineOrder) {
            setMaxWineOrder(eventState.currentWineOrder)
            // If user was viewing a wine beyond the new max, bring them back
            if (viewingWineOrder > eventState.currentWineOrder) {
                setViewingWineOrder(eventState.currentWineOrder)
            }
        }

        // If event just finished and user is NOT a Super User, redirect to results
        if (eventState.status === 'finished' && event.status !== 'finished' && !isSuperUser) {
            router.push(`/event/${event.id}/results`)
        }
    }, [eventState, maxWineOrder, viewingWineOrder, event.status, event.id, router, isSuperUser])

    // Helper to generate localStorage key for drafts
    const getDraftKey = (wineOrder: number, oderId: string) =>
        `wine-draft-${event.id}-${wineOrder}-${oderId}`

    // Helper to build FormData for a grade submission
    const createFormDataFrom = useCallback((data: NonNullable<GradeData>, wineOrder: number, forUserId: string) => {
        const formData = new FormData()
        formData.append('eventId', event.id)
        formData.append('wineOrder', wineOrder.toString())
        formData.append('colorScore', data.colorScore.toString())
        formData.append('smellScore', data.smellScore.toString())
        formData.append('tasteScore', data.tasteScore.toString())
        if (forUserId !== userId) {
            formData.append('targetUserId', forUserId)
        }
        return formData
    }, [event.id, userId])

    // Auto-commit grade to the database (fire-and-forget)
    const commitGrade = useCallback(async (gradeToCommit: GradeData, wineOrder: number, forUserId: string) => {
        if (!gradeToCommit || gradeToCommit.colorScore === 0 || gradeToCommit.smellScore === 0 || gradeToCommit.tasteScore === 0) return
        try {
            await submitGrade(null, createFormDataFrom(gradeToCommit, wineOrder, forUserId))
            localStorage.removeItem(getDraftKey(wineOrder, forUserId))
            setHasUnsavedChanges(false)
            setSubmitted(true)
        } catch (e) {
            console.error('Auto-save failed:', e)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createFormDataFrom])

    // sendBeacon-based commit for tab/browser close (synchronous, best-effort)
    const sendBeaconGrade = useCallback((gradeToSend: GradeData, wineOrder: number, forUserId: string) => {
        if (!gradeToSend || gradeToSend.colorScore === 0 || gradeToSend.smellScore === 0 || gradeToSend.tasteScore === 0) return
        navigator.sendBeacon('/api/grade', JSON.stringify({
            eventId: event.id,
            wineOrder,
            colorScore: gradeToSend.colorScore,
            smellScore: gradeToSend.smellScore,
            tasteScore: gradeToSend.tasteScore,
            targetUserId: forUserId !== userId ? forUserId : undefined,
        }))
    }, [event.id, userId])

    // Auto-commit on tab close / browser close
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (!hasUnsavedChangesRef.current) return
            sendBeaconGrade(gradeRef.current, viewingWineOrderRef.current, targetUserIdRef.current)
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [sendBeaconGrade])

    // Auto-commit on component unmount (e.g. Next.js route change)
    useEffect(() => {
        return () => {
            if (hasUnsavedChangesRef.current) {
                sendBeaconGrade(gradeRef.current, viewingWineOrderRef.current, targetUserIdRef.current)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sendBeaconGrade])

    // Auto-commit when super user changes target user
    useEffect(() => {
        if (targetUserId !== prevTargetUserIdRef.current) {
            const prevUser = prevTargetUserIdRef.current
            prevTargetUserIdRef.current = targetUserId
            if (hasUnsavedChangesRef.current) {
                commitGrade(gradeRef.current, viewingWineOrderRef.current, prevUser)
            }
        }
    }, [targetUserId, commitGrade])

    // Load grade when viewingWineOrder or targetUserId changes
    useEffect(() => {
        let cancelled = false

        const loadGrade = async () => {
            setIsLoadingGrade(true)
            setHasUnsavedChanges(false)
            try {
                const userGrade = await getUserGrade(event.id, viewingWineOrder, targetUserId)

                // If this request was superseded by a newer one, don't update state
                if (cancelled) return

                if (userGrade) {
                    // User has a submitted grade - use it
                    setGrade(userGrade)
                    setSubmitted(true)
                    // Clear any draft since we have a submitted grade
                    localStorage.removeItem(getDraftKey(viewingWineOrder, targetUserId))
                } else {
                    // No submitted grade - check for draft
                    const draftKey = getDraftKey(viewingWineOrder, targetUserId)
                    const savedDraft = localStorage.getItem(draftKey)
                    if (savedDraft) {
                        try {
                            const parsed = JSON.parse(savedDraft)
                            setGrade(parsed)
                            setHasUnsavedChanges(true)
                        } catch {
                            setGrade({ colorScore: 0, smellScore: 0, tasteScore: 0 })
                        }
                    } else {
                        setGrade({ colorScore: 0, smellScore: 0, tasteScore: 0 })
                    }
                    setSubmitted(false)
                }
            } catch {
                if (cancelled) return
                setGrade({ colorScore: 0, smellScore: 0, tasteScore: 0 })
                setSubmitted(false)
            } finally {
                if (!cancelled) {
                    setIsLoadingGrade(false)
                }
            }
        }

        loadGrade()

        // Cleanup: mark this request as cancelled if dependencies change before it completes
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewingWineOrder, targetUserId, event.id])

    // Navigation handlers — auto-commit current grade before switching wine
    const goToPreviousWine = () => {
        if (viewingWineOrder > 1) {
            if (hasUnsavedChanges) {
                commitGrade(grade, viewingWineOrder, targetUserId)
            }
            setViewingWineOrder(viewingWineOrder - 1)
        }
    }

    const goToNextWine = () => {
        if (viewingWineOrder < maxWineOrder) {
            if (hasUnsavedChanges) {
                commitGrade(grade, viewingWineOrder, targetUserId)
            }
            setViewingWineOrder(viewingWineOrder + 1)
            // Hide banner if user catches up to latest
            if (viewingWineOrder + 1 === maxWineOrder) {
                setShowNewWineBanner(false)
            }
        }
    }

    const goToLatestWine = () => {
        if (hasUnsavedChanges) {
            commitGrade(grade, viewingWineOrder, targetUserId)
        }
        setViewingWineOrder(maxWineOrder)
        setShowNewWineBanner(false)
    }

    const handleGradeChange = (field: keyof typeof grade, value: number) => {
        const newGrade = { ...grade!, [field]: value }
        setGrade(newGrade)
        setHasUnsavedChanges(true)
        // Auto-save draft to localStorage
        const draftKey = getDraftKey(viewingWineOrder, targetUserId)
        localStorage.setItem(draftKey, JSON.stringify(newGrade))
    }

    const handleSubmit = async () => {
        if (grade!.colorScore === 0 || grade!.smellScore === 0 || grade!.tasteScore === 0) return

        startTransition(async () => {
            await submitGrade(null, createFormData(grade!))
            setSubmitted(true)
            setShowSuccess(true)
            setHasUnsavedChanges(false)
            // Clear draft from localStorage on successful submit
            localStorage.removeItem(getDraftKey(viewingWineOrder, targetUserId))
            setTimeout(() => setShowSuccess(false), 3000)
        })
    }

    const createFormData = (data: typeof grade) => {
        return createFormDataFrom(data!, viewingWineOrder, targetUserId)
    }


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
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{submitted ? t.event.gradeUpdated : t.event.gradeSubmitted}</span>
                    </div>
                </div>
            )}

            {/* New Wine Available Banner */}
            {showNewWineBanner && (
                <div className="bg-amber-600/20 border border-amber-500/50 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🍷</span>
                        <div>
                            <p className="text-amber-400 font-medium">{t.event.newWineAvailable}</p>
                            <p className="text-stone-400 text-sm">{t.event.tastingMovedTo.replace('{wineNumber}', String(maxWineOrder))}</p>
                        </div>
                    </div>
                    <button
                        onClick={goToLatestWine}
                        className="px-4 py-2 bg-amber-500 text-stone-900 font-bold rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap"
                    >
                        {t.event.goToLatest}
                    </button>
                </div>
            )}

            <div className="text-center">
                {/* Wine Navigation */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                        onClick={goToPreviousWine}
                        disabled={viewingWineOrder <= 1}
                        className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous wine"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>

                    <span className="inline-block px-4 py-2 rounded-full bg-stone-800 text-amber-500 text-lg font-bold border border-stone-700 min-w-[120px]">
                        {t.event.wineNumber}{viewingWineOrder}
                        {viewingWineOrder < maxWineOrder && (
                            <span className="text-stone-500 text-sm font-normal"> / {maxWineOrder}</span>
                        )}
                    </span>

                    <button
                        onClick={goToNextWine}
                        disabled={viewingWineOrder >= maxWineOrder}
                        className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next wine"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <h2 className="text-4xl font-serif font-bold text-stone-100">
                    {event.status === 'finished' ? t.event.postEventCorrection : t.event.tastingInProgress}
                </h2>

                {/* Show if viewing past wine */}
                {viewingWineOrder < maxWineOrder && (
                    <p className="text-stone-500 text-sm mt-2">
                        {t.event.viewingPreviousWine.replace('{wineNumber}', String(maxWineOrder))}
                    </p>
                )}
            </div>

            {isSuperUser && users.length > 0 && (
                <div className="bg-stone-800 p-4 rounded-xl border border-amber-500/30">
                    <label className="block text-xs font-medium text-amber-500 uppercase tracking-wider mb-2">
                        {t.event.correctingGradeFor}
                    </label>
                    <select
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="w-full bg-stone-900 text-stone-100 border border-stone-700 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                    >
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.username} {u.id === userId ? t.event.meLabel : ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="bg-stone-800 p-4 sm:p-8 rounded-2xl shadow-xl border border-stone-700">
                {isLoadingGrade ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                        <span className="ml-3 text-stone-400">{t.event.loadingGrades}</span>
                    </div>
                ) : (
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
                            <div className="grid grid-cols-4 gap-1 sm:grid-cols-7">
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
                            {hasUnsavedChanges && !submitted && (
                                <p className="text-amber-400 text-sm text-center mb-3 flex items-center justify-center gap-2">
                                    <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                                    {t.event.unsavedChanges}
                                </p>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={isPending || grade!.colorScore === 0 || grade!.smellScore === 0 || grade!.tasteScore === 0}
                                className="w-full py-4 bg-amber-500 text-stone-900 font-bold rounded-xl shadow-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                            >
                                {isPending ? `${t.event.submitGrade}...` : submitted ? t.event.updateGrade : t.event.submitGrade}
                            </button>
                            {(grade!.colorScore === 0 || grade!.smellScore === 0 || grade!.tasteScore === 0) && (
                                <p className="text-stone-500 text-sm text-center mt-3">
                                    {t.event.selectAllScores}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {(isAdmin || isSuperUser) && (
                <div className="border-t border-stone-800 pt-8 mt-12">
                    <h3 className="text-stone-500 text-sm font-medium uppercase tracking-wider mb-4 text-center">{t.admin.adminControls}</h3>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <button
                            onClick={() => setConfirmAction('previous')}
                            disabled={maxWineOrder <= 1}
                            className="px-4 py-2 bg-stone-800 text-stone-400 rounded-lg hover:bg-stone-700 disabled:opacity-50"
                        >
                            {t.event.previousWine}
                        </button>
                        <button
                            onClick={() => setConfirmAction('next')}
                            className="px-4 py-2 bg-stone-800 text-amber-500 rounded-lg hover:bg-stone-700 border border-amber-500/30"
                        >
                            {t.event.nextWine}
                        </button>
                        <button
                            onClick={() => startTransition(async () => {
                                await finishEvent(event.id)
                                router.push(`/event/${event.id}/results`)
                            })}
                            className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 border border-red-900/50"
                        >
                            {t.event.finishEvent}
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-stone-800 rounded-2xl p-6 max-w-md mx-4 border border-stone-700 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-stone-100 mb-3">
                            {confirmAction === 'next' ? t.event.confirmNextWine : t.event.confirmPreviousWine}
                        </h3>
                        <p className="text-stone-400 mb-6">
                            {confirmAction === 'next'
                                ? t.event.confirmNextWineMessage.replace('{wineNumber}', String(maxWineOrder + 1))
                                : t.event.confirmPreviousWineMessage.replace('{wineNumber}', String(maxWineOrder - 1))
                            }
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="px-4 py-2 bg-stone-700 text-stone-300 rounded-lg hover:bg-stone-600 transition-colors"
                            >
                                {t.common.cancel}
                            </button>
                            <button
                                onClick={() => {
                                    startTransition(async () => {
                                        if (confirmAction === 'next') {
                                            await nextWine(event.id)
                                        } else {
                                            await previousWine(event.id)
                                        }
                                        setConfirmAction(null)
                                    })
                                }}
                                disabled={isPending}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${confirmAction === 'next'
                                        ? 'bg-amber-500 text-stone-900 hover:bg-amber-400'
                                        : 'bg-stone-600 text-stone-200 hover:bg-stone-500'
                                    }`}
                            >
                                {isPending ? t.common.loading : t.common.confirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
