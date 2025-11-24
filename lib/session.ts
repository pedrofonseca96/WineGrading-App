import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const key = new TextEncoder().encode(process.env.SESSION_SECRET || 'default_secret_key_change_me')

const cookie = {
    name: 'session',
    options: { httpOnly: true, secure: false, sameSite: 'lax' as const, path: '/' },
    duration: 24 * 60 * 60 * 1000,
}

export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1day')
        .sign(key)
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}

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
