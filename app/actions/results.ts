'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/session'

const UpdateWineSchema = z.object({
    eventId: z.string(),
    wineOrder: z.coerce.number(),
    name: z.string().min(1, "Name is required"),
    description: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    broughtBy: z.string().nullable().optional(),
})

export async function updateWineDetails(prevState: unknown, formData: FormData) {
    const session = await verifySession()

    const validatedFields = UpdateWineSchema.safeParse({
        eventId: formData.get('eventId'),
        wineOrder: formData.get('wineOrder'),
        name: formData.get('name'),
        description: formData.get('description'),
        imageUrl: formData.get('imageUrl'),
        broughtBy: formData.get('broughtBy'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { eventId, wineOrder, name, description, imageUrl, broughtBy } = validatedFields.data

    // Verify ownership
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event || event.creatorId !== session.userId) {
        return { message: 'Unauthorized' }
    }

    try {
        // Find existing wine by eventId + order
        const existingWine = await prisma.wine.findFirst({
            where: {
                eventId,
                order: wineOrder
            }
        })

        if (existingWine) {
            await prisma.wine.update({
                where: { id: existingWine.id },
                data: {
                    name,
                    description,
                    imageUrl: imageUrl || null,
                    broughtBy: broughtBy || null
                },
            })
        } else {
            await prisma.wine.create({
                data: {
                    eventId,
                    order: wineOrder,
                    name,
                    description,
                    imageUrl: imageUrl || null,
                    broughtBy: broughtBy || null
                }
            })
        }

        revalidatePath(`/event`)
        return { success: true }
    } catch (error) {
        console.error('Update wine error:', error)
        return {
            message: 'Database Error: Failed to update wine details.',
        }
    }
}
