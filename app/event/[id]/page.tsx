import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'
import EventClient from './EventClient'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await verifySession()

    const [event, user] = await Promise.all([
        prisma.event.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                status: true,
                currentWineOrder: true,
                creatorId: true,
                presentationMode: true,
            }
        }),
        prisma.user.findUnique({
            where: { id: session.userId },
            select: { role: true }
        })
    ])

    const allUsers = (user?.role === 'SUPER_USER')
        ? await prisma.user.findMany({ select: { id: true, username: true } })
        : []

    if (!event) {
        notFound()
    }

    // Redirect to presentation if it's active (applies to everyone)
    if (event.presentationMode) {
        redirect(`/event/${id}/presentation`)
    }

    const userGrade = await prisma.grade.findUnique({
        where: {
            userId_eventId_wineOrder: {
                userId: session.userId,
                eventId: event.id,
                wineOrder: event.currentWineOrder,
            },
        },
    })

    return (
        <div className="min-h-screen text-stone-100 p-4 md:p-8">
            <EventClient
                event={event}
                userId={session.userId}
                userRole={user?.role || 'USER'}
                initialGrade={userGrade}
                users={allUsers}
            />
        </div>
    )
}
