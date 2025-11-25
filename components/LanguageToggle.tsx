'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage()

    return (
        <button
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 transition-colors"
            title={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
        >
            <span className="text-sm font-medium text-stone-300">
                {language === 'pt' ? '🇵🇹 PT' : '🇬🇧 EN'}
            </span>
        </button>
    )
}
