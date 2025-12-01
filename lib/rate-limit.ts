import { prisma } from '@/lib/db'

export async function checkRateLimit(key: string, limit: number = 5, windowSeconds: number = 60) {
    const now = new Date()

    const record = await prisma.rateLimit.findUnique({
        where: { key }
    })

    if (record && record.expiresAt > now) {
        if (record.count >= limit) {
            return { success: false, reset: record.expiresAt }
        }

        await prisma.rateLimit.update({
            where: { key },
            data: { count: { increment: 1 } }
        })
        return { success: true, reset: record.expiresAt }
    }

    // Create new window or reset existing
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000)
    await prisma.rateLimit.upsert({
        where: { key },
        update: { count: 1, expiresAt },
        create: { key, count: 1, expiresAt }
    })

    return { success: true, reset: expiresAt }
}
