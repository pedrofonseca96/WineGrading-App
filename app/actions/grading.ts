'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

const gradeSchema = z.object({
    eventId: z.string(),
    wineOrder: z.coerce.number(),
    colorScore: z.coerce.number().min(1).max(3),
    smellScore: z.coerce.number().min(1).max(7),
    tasteScore: z.coerce.number().min(1).max(10),
})

export async function submitGrade(prevState: unknown, formData: FormData) {
    const session = await verifySession()

    const result = gradeSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        }
    }

    const { eventId, wineOrder, colorScore, smellScore, tasteScore } = result.data

    await prisma.grade.upsert({
        where: {
            userId_eventId_wineOrder: {
                userId: session.userId,
                eventId,
                wineOrder,
            },
        },
        update: {
            colorScore,
            smellScore,
            tasteScore,
        },
        create: {
            userId: session.userId,
            eventId,
            wineOrder,
            colorScore,
            smellScore,
            tasteScore,
        },
    })

    revalidatePath(`/event/${eventId}`)
    return { success: true }
}

export async function nextWine(eventId: string) {
    const session = await verifySession()
    const event = await prisma.event.findUnique({ where: { id: eventId } })

    if (!event || event.creatorId !== session.userId) {
        throw new Error('Unauthorized')
    }

    await prisma.event.update({
        where: { id: eventId },
        data: { currentWineOrder: { increment: 1 } },
    })

    revalidatePath(`/event/${eventId}`)
}

export async function previousWine(eventId: string) {
    const session = await verifySession()
    const event = await prisma.event.findUnique({ where: { id: eventId } })

    if (!event || event.creatorId !== session.userId) {
        throw new Error('Unauthorized')
    }

    if (event.currentWineOrder > 1) {
        await prisma.event.update({
            where: { id: eventId },
            data: { currentWineOrder: { decrement: 1 } },
        })
    }

    revalidatePath(`/event/${eventId}`)
}

export async function finishEvent(eventId: string) {
    const session = await verifySession()
    const event = await prisma.event.findUnique({ where: { id: eventId } })

    if (!event || event.creatorId !== session.userId) {
        throw new Error('Unauthorized')
    }

    await prisma.event.update({
        where: { id: eventId },
        data: {
            status: 'finished',
            presentationMode: false  // Turn off presentation mode when event finishes
        },
    })

    revalidatePath(`/event/${eventId}`, 'layout')
}
