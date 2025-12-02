import { prisma } from './lib/db'

async function checkWines() {
    const events = await prisma.event.findMany({
        include: {
            wines: true
        }
    })

    console.log('Found events:', events.length)
    for (const event of events) {
        console.log(`Event: ${event.name} (${event.id})`)
        console.log(`Status: ${event.status}`)
        console.log(`Presentation Mode: ${event.presentationMode}`)
        console.log(`Reveal Count: ${event.presentationRevealCount}`)
        console.log('Wines:')
        event.wines.forEach(w => {
            console.log(`  - Order ${w.order}: ${w.name || 'Unnamed'} (Brought By: "${w.broughtBy}")`)
        })
        console.log('---')
    }
}

checkWines()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
