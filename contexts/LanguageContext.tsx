'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations as ptTranslations, Translations } from '@/translations/pt'
import { translations as enTranslations } from '@/translations/en'

type Language = 'pt' | 'en'

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function detectBrowserLanguage(): Language {
    if (typeof window === 'undefined') return 'pt'

    const browserLang = navigator.language.toLowerCase()

    // Check if browser language is English
    if (browserLang.startsWith('en')) {
        return 'en'
    }

    // Default to Portuguese
    return 'pt'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Always start with 'pt' on both server and client to avoid hydration mismatch
    const [language, setLanguageState] = useState<Language>('pt')

    // Initialize language on mount (client-side only)
    useEffect(() => {
        const stored = localStorage.getItem('language') as Language | null
        const detected = detectBrowserLanguage()
        const initial = stored || detected
        setLanguageState(initial)
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('language', lang)
    }

    const translations = language === 'pt' ? ptTranslations : enTranslations

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations }}>
            <div suppressHydrationWarning>
                {children}
            </div>
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider')
    }
    return context
}
