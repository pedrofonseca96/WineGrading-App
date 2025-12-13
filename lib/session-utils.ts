import { SignJWT, jwtVerify } from 'jose'

const key = new TextEncoder().encode(process.env.SESSION_SECRET || 'default_secret_key_change_me')

export const cookie = {
    name: 'session',
    options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/'
    },
    duration: 24 * 60 * 60 * 1000,
}

export async function encrypt(payload: Record<string, unknown>) {
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
    } catch {
        return null
    }
}
