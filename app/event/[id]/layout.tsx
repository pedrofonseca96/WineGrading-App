import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/session'
import EventSync from './EventSync'

export default async function EventLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await verifySession()

    const [event, user] = await Promise.all([
        prisma.event.findUnique({
            where: { id },
            select: {
                status: true,
                presentationMode: true
            },
        }),
        prisma.user.findUnique({
            where: { id: session.userId },
            select: { role: true }
        })
    ])

    if (!event) return <>{children}</>

    return (
        <>
            <EventSync
                eventId={id}
                currentStatus={event.status}
                currentPresentationMode={event.presentationMode}
                userRole={user?.role || 'USER'}
            />
            {children}
        </>
    )
}
