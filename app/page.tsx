'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen text-stone-100 flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍷</span>
          <span className="text-2xl font-serif font-bold text-amber-500 tracking-tight">
            Junior Rocketeers
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-stone-300 hover:text-white transition-colors"
          >
            {t.auth.login}
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold rounded-full shadow-lg shadow-amber-900/30 transition-all hover:scale-105"
          >
            {t.auth.register}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-800/80 border border-stone-700/80 text-amber-400 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Real-time Blind Wine Grading</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-stone-100 leading-tight mb-6">
          {t.landing.title}
        </h1>

        <p className="text-lg sm:text-xl text-stone-300 max-w-2xl mb-10 leading-relaxed font-light">
          {t.landing.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-16">
          <Link
            href="/login"
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-lg rounded-xl shadow-xl shadow-amber-900/40 transition-all transform hover:-translate-y-0.5"
          >
            {t.landing.getStarted} →
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 bg-stone-800/90 hover:bg-stone-750 text-stone-200 border border-stone-700 font-bold text-lg rounded-xl transition-all"
          >
            {t.landing.register}
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-3 gap-6 text-left w-full max-w-4xl">
          <div className="p-6 bg-stone-900/70 backdrop-blur-md rounded-2xl border border-stone-800 hover:border-amber-500/30 transition-all">
            <div className="text-3xl mb-3">👁️</div>
            <h3 className="text-lg font-serif font-bold text-amber-500 mb-2">
              {t.landing.feature1Title}
            </h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              {t.landing.feature1Desc}
            </p>
          </div>

          <div className="p-6 bg-stone-900/70 backdrop-blur-md rounded-2xl border border-stone-800 hover:border-amber-500/30 transition-all">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-serif font-bold text-amber-500 mb-2">
              {t.landing.feature2Title}
            </h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              {t.landing.feature2Desc}
            </p>
          </div>

          <div className="p-6 bg-stone-900/70 backdrop-blur-md rounded-2xl border border-stone-800 hover:border-amber-500/30 transition-all">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-lg font-serif font-bold text-amber-500 mb-2">
              {t.landing.feature3Title}
            </h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              {t.landing.feature3Desc}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-stone-500 border-t border-stone-800/50 z-10">
        Junior Rocketeers © {new Date().getFullYear()} • Blind Wine Grading
      </footer>
    </div>
  )
}
