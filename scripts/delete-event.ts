import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const eventId = process.argv[2]

    if (!eventId) {
        console.error('Please provide an Event ID.')
        console.log('Usage: npx tsx scripts/delete-event.ts <EVENT_ID>')
        console.log('\nAvailable Events:')
        const events = await prisma.event.findMany({
            select: { id: true, name: true, date: true }
        })
        console.table(events)
        process.exit(1)
    }

    console.log(`\n🗑️  Deleting Event ID: ${eventId}...`)

    try {
        // 1. Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        })

        if (!event) {
            console.error('❌ Event not found!')
            process.exit(1)
        }

        console.log(`Found event: "${event.name}"`)

        // 2. Delete related Grades
        const deletedGrades = await prisma.grade.deleteMany({
            where: { eventId }
        })
        console.log(`✅ Deleted ${deletedGrades.count} grades.`)

        // 3. Delete related Wines
        const deletedWines = await prisma.wine.deleteMany({
            where: { eventId }
        })
        console.log(`✅ Deleted ${deletedWines.count} wines.`)

        // 4. Delete the Event
        await prisma.event.delete({
            where: { id: eventId }
        })
        console.log(`✅ Event "${event.name}" deleted successfully!`)

    } catch (error) {
        console.error('❌ Error deleting event:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
