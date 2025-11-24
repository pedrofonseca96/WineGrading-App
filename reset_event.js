const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetEvent() {
    const event = await prisma.event.findFirst({
        where: { name: 'New Grand Tasting Demo' }
    })

    if (event) {
        await prisma.event.update({
            where: { id: event.id },
            data: {
                status: 'active',
                currentWineOrder: 1,
                presentationMode: false,
                presentationRevealCount: 0
            }
        })
        console.log('Event reset successfully')
    } else {
        console.log('Event not found')
    }
}

resetEvent()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
