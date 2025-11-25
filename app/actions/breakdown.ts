'use server'

import { prisma } from '@/lib/db'

export async function getWineGradeBreakdown(eventId: string, wineOrder: number) {
    const grades = await prisma.grade.findMany({
        where: {
            eventId,
            wineOrder
        },
        include: {
            user: {
                select: {
                    username: true
                }
            }
        }
    })

    return grades.map(grade => ({
        userId: grade.userId,
        username: grade.user.username,
        colorScore: grade.colorScore,
        smellScore: grade.smellScore,
        tasteScore: grade.tasteScore,
        totalScore: grade.colorScore + grade.smellScore + grade.tasteScore
    }))
}
