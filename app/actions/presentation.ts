'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/session'

async function verifyEventAdmin(eventId: string) {
    const session = await verifySession()
    const [event, currentUser] = await Promise.all([
        prisma.event.findUnique({ where: { id: eventId } }),
        prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    ])

    if (!event || (event.creatorId !== session.userId && currentUser?.role !== 'SUPER_USER')) {
        throw new Error('Unauthorized')
    }
    return event
}

export async function startPresentation(eventId: string) {
    await verifyEventAdmin(eventId)
    await prisma.event.update({
        where: { id: eventId },
        data: { presentationMode: true, presentationRevealCount: 0 }
    })
    revalidatePath(`/event/${eventId}`, 'layout')
}

export async function updateRevealCount(eventId: string, count: number) {
    await verifyEventAdmin(eventId)
    await prisma.event.update({
        where: { id: eventId },
        data: { presentationRevealCount: count }
    })
    revalidatePath(`/event/${eventId}`, 'layout')
}

export async function finishPresentation(eventId: string) {
    await verifyEventAdmin(eventId)
    await prisma.event.update({
        where: { id: eventId },
        data: { presentationMode: false, status: 'finished' }
    })
    revalidatePath(`/event/${eventId}`, 'layout')
}

export async function updateBroughtBy(eventId: string, wineOrder: number, broughtBy: string) {
    await verifyEventAdmin(eventId)
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
