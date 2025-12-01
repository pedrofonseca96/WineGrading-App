'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function login(prevState: any, formData: FormData) {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const limit = await checkRateLimit(`login:${ip}`, 5, 60)

    if (!limit.success) {
        return {
            errors: {
                root: ['Too many attempts. Please try again later.'],
            },
        }
    }

    const result = loginSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        }
    }

    const { username, password } = result.data

    const user = await prisma.user.findUnique({
        where: { username },
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return {
            errors: {
                root: ['Invalid username or password'],
            },
        }
    }

    await createSession(user.id)
    redirect('/dashboard')
}

export async function register(prevState: any, formData: FormData) {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const limit = await checkRateLimit(`register:${ip}`, 5, 60)

    if (!limit.success) {
        return {
            errors: {
                root: ['Too many attempts. Please try again later.'],
            },
        }
    }

    const result = registerSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        }
    }

    const { username, password } = result.data

    const existingUser = await prisma.user.findUnique({
        where: { username },
    })

    if (existingUser) {
        return {
            errors: {
                username: ['Username already taken'],
            },
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    })

    await createSession(user.id)
    redirect('/dashboard')
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}
