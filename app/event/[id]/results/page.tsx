import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { updateWineDetails } from '@/app/actions/results'
import Link from 'next/link'
import EditWineForm from './EditWineForm'
import StartPresentationButton from './StartPresentationButton'

async function getResults(eventId: string) {
    const grades = await prisma.grade.findMany({
        where: { eventId },
    })

    const wines = await prisma.wine.findMany({
        where: { eventId },
    })

    // Group grades by wineOrder
    const results = new Map<number, {
        order: number
        totalScore: number
        colorScore: number
        smellScore: number
        tasteScore: number
        count: number
        wine?: typeof wines[0]
    }>()

    grades.forEach((grade) => {
        const current = results.get(grade.wineOrder) || {
            order: grade.wineOrder,
            totalScore: 0,
            colorScore: 0,
            smellScore: 0,
            tasteScore: 0,
            count: 0,
        }

        current.totalScore += grade.colorScore + grade.smellScore + grade.tasteScore
        current.colorScore += grade.colorScore
        current.smellScore += grade.smellScore
        current.tasteScore += grade.tasteScore
        current.count += 1
        results.set(grade.wineOrder, current)
    })

    // Attach wine details
    wines.forEach((wine) => {
        if (results.has(wine.order)) {
            results.get(wine.order)!.wine = wine
        } else {
            // If no grades but wine exists (e.g. pre-added), add it?
            // For now, only show wines that have grades or exist.
            results.set(wine.order, {
                order: wine.order,
                totalScore: 0,
                colorScore: 0,
                smellScore: 0,
                tasteScore: 0,
                count: 0,
                wine
            })
        }
    })

    return Array.from(results.values()).sort((a, b) => b.totalScore - a.totalScore)
}

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await verifySession()
    const event = await prisma.event.findUnique({ where: { id } })
    const results = await getResults(id)

    const isAdmin = event?.creatorId === session.userId

    return (
        <div className="min-h-screen text-stone-100 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-amber-500">Results</h1>
                        <p className="text-stone-400 mt-2">{event?.name}</p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 border border-stone-600 rounded-md text-stone-300 hover:bg-stone-800 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                        {isAdmin && (
                            <StartPresentationButton eventId={id} />
                        )}
                    </div>
                </header>

                <div className="space-y-8">
                    {results.map((result, index) => (
                        <div key={result.order} className="bg-stone-800 rounded-xl border border-stone-700 overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-stone-700 text-amber-500 font-bold text-xl border border-stone-600">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-serif font-bold text-stone-100">
                                            {result.wine?.name || `Wine #${result.order}`}
                                        </h3>
                                        <p className="text-stone-400 text-sm">
                                            {result.wine?.description || 'No description added'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-amber-500">{result.totalScore}</div>
                                    <div className="text-stone-500 text-xs uppercase tracking-wider">Total Score</div>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="bg-stone-850 px-6 py-4 border-t border-stone-700 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-semibold text-stone-300">{result.colorScore}</div>
                                    <div className="text-stone-500 text-xs">Color</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-stone-300">{result.smellScore}</div>
                                    <div className="text-stone-500 text-xs">Smell</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-stone-300">{result.tasteScore}</div>
                                    <div className="text-stone-500 text-xs">Taste</div>
                                </div>
                            </div>

                            {/* Admin Edit Form */}
                            {isAdmin && (
                                <div className="bg-stone-900/50 px-6 py-4 border-t border-stone-700">
                                    <EditWineForm
                                        eventId={id}
                                        wineOrder={result.order}
                                        initialName={result.wine?.name}
                                        initialDescription={result.wine?.description}
                                        initialImageUrl={result.wine?.imageUrl}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
