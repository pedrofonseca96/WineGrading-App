'use server'

import { prisma } from '@/lib/db'
import { unstable_noStore as noStore } from 'next/cache'

export async function getEventSyncState(eventId: string) {
    noStore()
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
            status: true,
            currentWineOrder: true,
            presentationMode: true,
        },
    })
    return event
}
