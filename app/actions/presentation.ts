'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/session'

async function verifyEventOwner(eventId: string) {
    const session = await verifySession()
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event || event.creatorId !== session.userId) {
        throw new Error('Unauthorized')
    }
    return event
}

export async function startPresentation(eventId: string) {
    await verifyEventOwner(eventId)
    await prisma.event.update({
        where: { id: eventId },
        data: { presentationMode: true, presentationRevealCount: 0 }
    })
    revalidatePath(`/event/${eventId}`, 'layout')
}

export async function updateRevealCount(eventId: string, count: number) {
    await verifyEventOwner(eventId)
    await prisma.event.update({
        where: { id: eventId },
        data: { presentationRevealCount: count }
    })
    revalidatePath(`/event/${eventId}`, 'layout')
}

export async function finishPresentation(eventId: string) {
    await verifyEventOwner(eventId)
    await prisma.event.update({
        where: { id: eventId },
        data: { presentationMode: false, status: 'finished' }
    })
    revalidatePath(`/event/${eventId}`, 'layout')
}

export async function updateBroughtBy(eventId: string, wineOrder: number, broughtBy: string) {
    await verifyEventOwner(eventId)
    await prisma.wine.updateMany({
        where: {
            eventId: eventId,
            order: wineOrder
        },
        data: {
            broughtBy: broughtBy
        }
    })
}

export async function getPresentationState(eventId: string) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { presentationMode: true, presentationRevealCount: true }
    })
    return event
}
