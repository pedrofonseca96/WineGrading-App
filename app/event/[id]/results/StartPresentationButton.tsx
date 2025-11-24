'use client'

import { startPresentation } from '@/app/actions/presentation'
import { useRouter } from 'next/navigation'

export default function StartPresentationButton({ eventId }: { eventId: string }) {
    const router = useRouter()

    const handleStart = async () => {
        await startPresentation(eventId)
        router.push(`/event/${eventId}/presentation`)
    }

    return (
        <button
            onClick={handleStart}
            className="px-4 py-2 bg-amber-600 text-stone-900 font-medium rounded-md hover:bg-amber-500 transition-colors"
        >
            Start Presentation
        </button>
    )
}
