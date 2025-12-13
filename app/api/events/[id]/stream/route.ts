import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await verifySession()
    } catch {
        return new Response('Unauthorized', { status: 401 })
    }

    const { id } = await params

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            let lastState = ''

            // Send initial connection message
            controller.enqueue(encoder.encode(': connected\n\n'))

            const interval = setInterval(async () => {
                try {
                    const event = await prisma.event.findUnique({
                        where: { id },
                        select: {
                            status: true,
                            currentWineOrder: true,
                            presentationMode: true,
                            presentationRevealCount: true,
                        },
                    })

                    if (!event) {
                        // Client disconnected or event not found
                        controller.close()
                        clearInterval(interval)
                        return
                    }

                    const currentState = JSON.stringify(event)

                    if (currentState !== lastState) {
                        controller.enqueue(encoder.encode(`data: ${currentState}\n\n`))
                        lastState = currentState
                    } else {
                        // Send heartbeat to keep connection alive
                        controller.enqueue(encoder.encode(': heartbeat\n\n'))
                    }
                } catch (error) {
                    console.error('SSE Error:', error)
                    controller.close()
                    clearInterval(interval)
                }
            }, 1000) // Check every 1 second

            // Clean up on close
            req.signal.addEventListener('abort', () => {
                clearInterval(interval)
            })
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
}
