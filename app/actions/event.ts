'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'

const createEventSchema = z.object({
    name: z.string().min(1, 'Event name is required'),
})

export async function createEvent(prevState: any, formData: FormData) {
    const session = await verifySession()

    const result = createEventSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        }
    }

    const { name } = result.data

    const event = await prisma.event.create({
        data: {
            name,
            status: 'active',
            creatorId: session.userId,
        },
    })

    redirect(`/event/${event.id}`)
}
