const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixPresentationMode() {
    // Update all finished events to turn off presentation mode
    const result = await prisma.event.updateMany({
        where: {
            status: 'finished',
            presentationMode: true
        },
        data: {
            presentationMode: false
        }
    })

    console.log(`Updated ${result.count} finished events to turn off presentation mode`)
    await prisma.$disconnect()
}

fixPresentationMode()
