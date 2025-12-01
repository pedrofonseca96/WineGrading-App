import { prisma } from '@/lib/db'
import EventSync from './EventSync'

export default async function EventLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const event = await prisma.event.findUnique({
        where: { id },
        select: {
            status: true,
            presentationMode: true
        },
    })

    if (!event) return <>{children}</>

    return (
        <>
            <EventSync
                eventId={id}
                currentStatus={event.status}
                currentPresentationMode={event.presentationMode}
            />
            {children}
        </>
    )
}
