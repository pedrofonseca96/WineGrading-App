import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { encrypt, decrypt, cookie } from './session-utils'

export async function createSession(userId: string) {
    const expires = new Date(Date.now() + cookie.duration)
    const session = await encrypt({ userId, expires })

    const cookieStore = await cookies()
    cookieStore.set(cookie.name, session, { ...cookie.options, expires })
}

export async function verifySession() {
    const cookieStore = await cookies()
    const session = cookieStore.get(cookie.name)?.value
    const payload = await decrypt(session)

    if (!payload?.userId) {
        redirect('/login')
    }

    return { userId: payload.userId as string }
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete(cookie.name)
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get(cookie.name)?.value
    const payload = await decrypt(session)
    return payload
}
