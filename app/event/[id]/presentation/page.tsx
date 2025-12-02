import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'
import PresentationClient from './PresentationClient'

async function getResults(eventId: string) {
    const grades = await prisma.grade.findMany({
        where: { eventId },
    })

    const wines = await prisma.wine.findMany({
        where: { eventId },
    })

    const results = new Map<number, {
        order: number
        totalScore: number
        colorScore: number
        smellScore: number
        tasteScore: number
        wine?: { name: string | null; description: string | null; imageUrl: string | null; broughtBy: string | null }
    }>()

    grades.forEach((grade) => {
        const current = results.get(grade.wineOrder) || {
            order: grade.wineOrder,
            totalScore: 0,
            colorScore: 0,
            smellScore: 0,
            tasteScore: 0,
        }

        current.totalScore += grade.colorScore + grade.smellScore + grade.tasteScore
        current.colorScore += grade.colorScore
        current.smellScore += grade.smellScore
        current.tasteScore += grade.tasteScore
        results.set(grade.wineOrder, current)
    })

    wines.forEach((wine) => {
        if (results.has(wine.order)) {
            results.get(wine.order)!.wine = {
                name: wine.name,
                description: wine.description,
                imageUrl: wine.imageUrl,
                broughtBy: wine.broughtBy
            }
        }
    })

    return Array.from(results.values())
}

export default async function PresentationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await verifySession()
    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
        notFound()
    }

    const isCreator = event.creatorId === session.userId

    if (!event.presentationMode) {
        redirect(`/event/${id}`)
    }

    const results = await getResults(id)

    // Fetch data for Scorecard
    const users = await prisma.user.findMany({
        where: {
            grades: {
                some: { eventId: id }
            }
        },
        select: { id: true, username: true }
    })

    const grades = await prisma.grade.findMany({
        where: { eventId: id },
        select: { userId: true, wineOrder: true, colorScore: true, smellScore: true, tasteScore: true }
    }).then(grades => grades.map(g => ({
        userId: g.userId,
        wineOrder: g.wineOrder,
        totalScore: g.colorScore + g.smellScore + g.tasteScore
    })))

    return (
        <PresentationClient
            results={results}
            eventId={id}
            isCreator={isCreator}
            initialRevealCount={event.presentationRevealCount}
            users={users}
            grades={grades}
        />
    )
}
