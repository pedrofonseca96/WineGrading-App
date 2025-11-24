'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import * as cheerio from 'cheerio'

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

export async function fetchWineImage(query: string) {
    try {
        // Attempt to scrape Bing Images (simple, brittle, but works for demo)
        // In production, use a real API like Google Custom Search or Bing Search API
        const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query + ' wine bottle')}&first=1`

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        const html = await response.text()
        const $ = cheerio.load(html)

        // Bing stores images in 'murl' or similar attributes in the HTML
        // This selector might need adjustment as Bing changes their layout
        // Looking for the first image result
        const imgElement = $('a.iusc').first()
        const m = imgElement.attr('m')

        if (m) {
            const metadata = JSON.parse(m)
            return metadata.murl // The direct image URL
        }

        return null
    } catch (error) {
        console.error('Error fetching wine image:', error)
        return null
    }
}
