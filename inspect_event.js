const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const event = await prisma.event.findUnique({
        where: { id: 'fc36fa18-8c7c-4b1f-9d07-2e554beae089' },
        select: { id: true, name: true, status: true, presentationMode: true }
    })
    console.log(JSON.stringify(event, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
