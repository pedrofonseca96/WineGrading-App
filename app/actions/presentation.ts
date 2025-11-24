'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function startPresentation(eventId: string) {
    await prisma.event.update({
        where: { id: eventId },
        data: { presentationMode: true, presentationRevealCount: 0 }
    })
    revalidatePath(`/event/${eventId}`, 'layout')
}

export async function updateRevealCount(eventId: string, count: number) {
    await prisma.event.update({
        where: { id: eventId },
        data: { presentationRevealCount: count }
    })
    revalidatePath(`/event/${eventId}`, 'layout')
}

export async function getPresentationState(eventId: string) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { presentationMode: true, presentationRevealCount: true }
    })
    return event
}
