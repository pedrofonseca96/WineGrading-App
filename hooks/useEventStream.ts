import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type EventState = {
    status: string
    currentWineOrder: number
    presentationMode: boolean
    presentationRevealCount: number
}

export function useEventStream(eventId: string) {
    const [eventState, setEventState] = useState<EventState | null>(null)
    const router = useRouter()

    useEffect(() => {
        let eventSource: EventSource | null = null
        let retryTimeout: NodeJS.Timeout

        const connect = () => {
            eventSource = new EventSource(`/api/events/${eventId}/stream`)

            eventSource.onmessage = (event) => {
                try {
                    const newState = JSON.parse(event.data)
                    setEventState(newState)
                } catch (error) {
                    console.error('Error parsing SSE data:', error)
                }
            }

            eventSource.onerror = (error) => {
                console.error('SSE Error:', error)
                eventSource?.close()
                // Retry connection after 3 seconds
                retryTimeout = setTimeout(connect, 3000)
            }
        }

        connect()

        return () => {
            eventSource?.close()
            clearTimeout(retryTimeout)
        }
    }, [eventId])

    return eventState
}
