'use client'

import { useLanguage } from '@/contexts/LanguageContext'

type ScorecardProps = {
    wines: {
        order: number
        name: string | null
        broughtBy: string | null
        totalScore: number
    }[]
    users: {
        id: string
        username: string
    }[]
    grades: {
        userId: string
        wineOrder: number
        totalScore: number
    }[]
    isFinished: boolean
    revealedWineOrders: number[]
}

export default function Scorecard({ wines, users, grades, isFinished, revealedWineOrders }: ScorecardProps) {
    const { t } = useLanguage()

    // Sort wines by order
    const sortedWines = [...wines].sort((a, b) => a.order - b.order)

    // Calculate winner (person who brought the highest scoring wine)
    // Note: wines are already passed in, we can find the max score
    const maxScore = Math.max(...wines.map(w => w.totalScore))
    const winners = wines.filter(w => w.totalScore === maxScore).map(w => w.broughtBy).filter(Boolean)

    // Calculate aggregate scores per person who brought wines
    const broughtByScores = new Map<string, { totalScore: number; wineCount: number }>()
    wines.forEach(wine => {
        if (wine.broughtBy) {
            const current = broughtByScores.get(wine.broughtBy) || { totalScore: 0, wineCount: 0 }
            current.totalScore += wine.totalScore
            current.wineCount += 1
            broughtByScores.set(wine.broughtBy, current)
        }
    })

    // Sort by total score descending
    const broughtByLeaderboard = Array.from(broughtByScores.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.totalScore - a.totalScore)

    return (
        <div className="mt-16 bg-stone-900/50 rounded-2xl border border-stone-800 overflow-hidden">
            <div className="p-6 border-b border-stone-800">
                <h2 className="text-2xl font-serif font-bold text-amber-500">{t.scorecard.title}</h2>
                {isFinished && winners.length > 0 && (
                    <p className="text-stone-400 mt-2">
                        {t.scorecard.winner} <span className="text-amber-400 font-bold">{winners.join(', ')}</span>
                    </p>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 border-b border-stone-800 bg-stone-900/80 sticky left-0 z-10 text-stone-300 font-medium">
                                {t.scorecard.participant}
                            </th>
                            {sortedWines.map(wine => (
                                <th key={wine.order} className="p-4 border-b border-stone-800 text-stone-400 font-normal whitespace-nowrap">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-amber-500">#{wine.order}</span>
                                        <span className="text-xs text-stone-500 max-w-[100px] truncate">
                                            {isFinished || revealedWineOrders.includes(wine.order) ? (wine.broughtBy || '-') : '???'}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-stone-800/30 transition-colors">
                                <td className="p-4 border-b border-stone-800/50 bg-stone-900/40 sticky left-0 font-medium text-stone-300">
                                    {user.username}
                                </td>
                                {sortedWines.map(wine => {
                                    const grade = grades.find(g => g.userId === user.id && g.wineOrder === wine.order)
                                    return (
                                        <td key={wine.order} className="p-4 border-b border-stone-800/50 text-center text-stone-400">
                                            {grade ? grade.totalScore : '-'}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                        {/* Total Row */}
                        <tr className="bg-amber-900/10 font-bold">
                            <td className="p-4 sticky left-0 bg-stone-900/90 text-amber-500">
                                {t.scorecard.total}
                            </td>
                            {sortedWines.map(wine => (
                                <td key={wine.order} className="p-4 text-center text-amber-500">
                                    {wine.totalScore}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Aggregate Scores by Person Who Brought Wines */}
            {isFinished && broughtByLeaderboard.length > 0 && (
                <div className="p-6 border-t border-stone-800">
                    <h3 className="text-xl font-serif font-bold text-amber-500 mb-4">{t.scorecard.broughtByLeaderboard}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-3 border-b border-stone-800 text-stone-400 font-medium">{t.scorecard.rank}</th>
                                    <th className="p-3 border-b border-stone-800 text-stone-400 font-medium">{t.scorecard.name}</th>
                                    <th className="p-3 border-b border-stone-800 text-stone-400 font-medium text-center">{t.scorecard.wines}</th>
                                    <th className="p-3 border-b border-stone-800 text-stone-400 font-medium text-right">{t.scorecard.totalScore}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {broughtByLeaderboard.map((entry, index) => (
                                    <tr key={entry.name} className="hover:bg-stone-800/30 transition-colors">
                                        <td className="p-3 border-b border-stone-800/50 text-stone-500">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </td>
                                        <td className="p-3 border-b border-stone-800/50 font-medium text-stone-300">
                                            {entry.name}
                                        </td>
                                        <td className="p-3 border-b border-stone-800/50 text-center text-stone-400">
                                            {entry.wineCount}
                                        </td>
                                        <td className="p-3 border-b border-stone-800/50 text-right font-bold text-amber-500">
                                            {entry.totalScore}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
