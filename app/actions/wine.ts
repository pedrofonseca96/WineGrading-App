'use server'

import { prisma } from '@/lib/db'

export async function getWineDetails(eventId: string, wineOrder: number) {
    const wine = await prisma.wine.findFirst({
        where: {
            eventId: eventId,
            order: wineOrder
        },
        select: {
            name: true,
            description: true,
            imageUrl: true
        }
    })
    return wine
}
