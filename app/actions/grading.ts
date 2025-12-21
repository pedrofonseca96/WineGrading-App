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
    targetUserId: z.string().optional(),
})

export async function getUserGrade(eventId: string, wineOrder: number, targetUserId: string) {
    const session = await verifySession()

    // Security check: Only SUPER_USER can fetch others' grades
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    })

    if (currentUser?.role !== 'SUPER_USER' && session.userId !== targetUserId) {
        throw new Error('Unauthorized')
    }

    return prisma.grade.findUnique({
        where: {
            userId_eventId_wineOrder: {
                userId: targetUserId,
                eventId,
                wineOrder,
            },
        },
    })
}

export async function submitGrade(prevState: unknown, formData: FormData) {
    const session = await verifySession()

    const result = gradeSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        }
    }

    const { eventId, wineOrder, colorScore, smellScore, tasteScore, targetUserId } = result.data

    let userIdForGrade = session.userId

    // If targetUserId is provided, check if current user is SUPER_USER
    if (targetUserId && targetUserId !== session.userId) {
        const currentUser = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { role: true }
        })

        if (currentUser?.role !== 'SUPER_USER') {
            throw new Error('Unauthorized: Only Super Users can submit grades for others')
        }
        userIdForGrade = targetUserId
    }

    await prisma.grade.upsert({
        where: {
            userId_eventId_wineOrder: {
                userId: userIdForGrade,
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
            userId: userIdForGrade,
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

    const [event, currentUser] = await Promise.all([
        prisma.event.findUnique({ where: { id: eventId } }),
        prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    ])

    if (!event || (event.creatorId !== session.userId && currentUser?.role !== 'SUPER_USER')) {
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

    const [event, currentUser] = await Promise.all([
        prisma.event.findUnique({ where: { id: eventId } }),
        prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    ])

    if (!event || (event.creatorId !== session.userId && currentUser?.role !== 'SUPER_USER')) {
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

    const [event, currentUser] = await Promise.all([
        prisma.event.findUnique({ where: { id: eventId } }),
        prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    ])

    if (!event || (event.creatorId !== session.userId && currentUser?.role !== 'SUPER_USER')) {
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
