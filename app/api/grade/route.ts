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

export async function POST(req: Request) {
    let session
    try {
        session = await verifySession()
    } catch {
        return new Response('Unauthorized', { status: 401 })
    }

    let body
    try {
        body = await req.json()
    } catch {
        return new Response('Invalid JSON', { status: 400 })
    }

    const result = gradeSchema.safeParse(body)
    if (!result.success) {
        return new Response('Invalid data', { status: 400 })
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
            return new Response('Unauthorized: Only Super Users can submit grades for others', { status: 403 })
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
    return new Response('OK', { status: 200 })
}
