'use server'

import { prisma } from '@/lib/db'

export async function getEventSyncState(eventId: string) {
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
