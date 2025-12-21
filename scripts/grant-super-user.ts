import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const username = process.argv[2]

    if (!username) {
        console.error('Please provide a Username.')
        console.log('Usage: npx tsx scripts/grant-super-user.ts <USERNAME>')
        console.log('\nAvailable Users:')
        const users = await prisma.user.findMany({
            select: { id: true, username: true, role: true }
        })
        console.table(users)
        process.exit(1)
    }

    console.log(`\n👑  Granting SUPER_USER role to: ${username}...`)

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        })

        if (!user) {
            console.error('❌ User not found!')
            process.exit(1)
        }

        await prisma.user.update({
            where: { username },
            data: { role: 'SUPER_USER' }
        })

        console.log(`✅ User "${username}" is now a SUPER_USER!`)

    } catch (error) {
        console.error('❌ Error updating user role:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
