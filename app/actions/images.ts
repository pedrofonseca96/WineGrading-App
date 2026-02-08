'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'


export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) {
        throw new Error('No file uploaded')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Save file
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    return `/uploads/${filename}`
}

export type ImageFetchResult =
    | { success: true; url: string }
    | { success: false; error: 'no_api_key' | 'rate_limit' | 'no_results' | 'server_error' | 'invalid_request' }

export async function fetchWineImage(query: string): Promise<ImageFetchResult> {
    const apiKey = process.env.SERPER_API_KEY

    if (!apiKey) {
        console.warn('SERPER_API_KEY is not set. Image fetching disabled.')
        return { success: false, error: 'no_api_key' }
    }

    try {
        const response = await fetch('https://google.serper.dev/images', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: query + ' wine bottle',
                gl: 'us',
                hl: 'en'
            })
        })

        if (!response.ok) {
            console.error('Serper API error:', response.status, await response.text())

            // Map HTTP status codes to error types
            if (response.status === 401 || response.status === 403) {
                return { success: false, error: 'no_api_key' }
            }
            if (response.status === 429) {
                return { success: false, error: 'rate_limit' }
            }
            if (response.status === 400 || response.status === 404) {
                return { success: false, error: 'invalid_request' }
            }
            // 500, 503, or other
            return { success: false, error: 'server_error' }
        }

        const data = await response.json()

        // Serper returns { images: [ { imageUrl: '...', ... } ] }
        if (data.images && data.images.length > 0) {
            return { success: true, url: data.images[0].imageUrl }
        }

        return { success: false, error: 'no_results' }
    } catch (error) {
        console.error('Error fetching wine image:', error)
        return { success: false, error: 'server_error' }
    }
}
