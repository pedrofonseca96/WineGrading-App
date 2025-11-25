'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getEventSyncState } from '@/app/actions/sync'

export default function EventSync({
    eventId,
    currentWineOrder
}: {
    eventId: string
    currentWineOrder: number
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [lastWineOrder, setLastWineOrder] = useState(currentWineOrder)

    useEffect(() => {
        // Don't sync if we're already on presentation page
        if (pathname.includes('/presentation')) return

        const interval = setInterval(async () => {
            const state = await getEventSyncState(eventId)
            if (!state) return

            // Handle Presentation Mode
            if (state.presentationMode) {
                if (!pathname.includes('/presentation')) {
                    console.log('[EventSync] Redirecting to presentation due to presentationMode=true')
                    router.replace(`/event/${eventId}/presentation`)
                }
                return
            }

            // Handle Wine Change (only for active events)
            if (state.status === 'active' && state.currentWineOrder !== lastWineOrder) {
                setLastWineOrder(state.currentWineOrder)
                router.refresh()
            }
        }, 2000)

        return () => clearInterval(interval)
    }, [eventId, lastWineOrder, pathname, router])

    return null
}
