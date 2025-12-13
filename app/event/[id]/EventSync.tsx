'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useEventStream } from '@/hooks/useEventStream'

interface EventSyncProps {
    eventId: string
    currentStatus: string
    currentPresentationMode: boolean
}

export default function EventSync({ eventId, currentStatus }: EventSyncProps) {
    const router = useRouter()
    const pathname = usePathname()
    const eventState = useEventStream(eventId)

    useEffect(() => {
        if (!eventState) return

        // Redirect to presentation if mode is on and we're not there
        if (eventState.presentationMode && !pathname.includes('/presentation')) {
            router.push(`/event/${eventId}/presentation`)
            return
        }

        // Reload if status changes (e.g. active -> finished)
        if (eventState.status && eventState.status !== currentStatus) {
            router.refresh()
            return
        }

        // If presentation mode is turned OFF, but we are on the presentation page, go back
        if (!eventState.presentationMode && pathname.includes('/presentation')) {
            router.push(`/event/${eventId}`)
            return
        }

    }, [eventState, router, pathname, eventId, currentStatus])

    return null
}
