import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/session'
import DashboardClient from './DashboardClient'

async function getEvents() {
    const events = await prisma.event.findMany({
        orderBy: { date: 'desc' },
    })
    return events
}

export default async function DashboardPage() {
    const session = await verifySession()
    const events = await getEvents()

    return <DashboardClient events={events} />
}
