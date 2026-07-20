'use client'

import { useFormStatus } from 'react-dom'
import { useState, useRef, useActionState } from 'react'
import { fetchWineImage } from '@/app/actions/images'
import { updateWineDetails } from '@/app/actions/results'
import { useLanguage } from '@/contexts/LanguageContext'

type EditWineFormProps = {
    eventId: string
    wineOrder: number
    initialName?: string | null
    initialDescription?: string | null
    initialImageUrl?: string | null
    initialBroughtBy?: string | null
    users: { id: string; username: string }[]
}

export default function EditWineForm({ eventId, wineOrder, initialName, initialDescription, initialImageUrl, initialBroughtBy, users }: EditWineFormProps) {
    const [state, action] = useActionState(updateWineDetails, undefined)
    const [imageUrl, setImageUrl] = useState(initialImageUrl || '')
    const [isFetching, setIsFetching] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const { t } = useLanguage()

    const nameInputRef = useRef<HTMLInputElement>(null)

    const handleFetchImage = async () => {
        const query = nameInputRef.current?.value
        if (!query) return

        setIsFetching(true)
        setFetchError(null)
        try {
            const result = await fetchWineImage(query)
            if (result.success) {
                setImageUrl(result.url)
            } else {
                // Map error code to translated message
                const errorMessages: Record<string, string> = {
                    no_api_key: t.imageFetch.noApiKey,
                    rate_limit: t.imageFetch.rateLimit,
                    no_results: t.imageFetch.noResults,
                    server_error: t.imageFetch.serverError,
                    invalid_request: t.imageFetch.invalidRequest,
                }
                setFetchError(errorMessages[result.error] || t.imageFetch.serverError)
            }
        } finally {
            setIsFetching(false)
        }
    }

    const handleClearImage = () => {
        setImageUrl('')
        // If there's a file input, we might want to clear it too, but it's hidden and controlled by onChange
    }



    return (
        <form action={action} className="flex flex-col gap-4 p-4 bg-stone-900/50 rounded-xl border border-stone-800">
            <input type="hidden" name="eventId" value={eventId} />
            <input type="hidden" name="wineOrder" value={wineOrder} />

            <div className="flex gap-4">
                {/* Image Preview & Controls */}
                <div className="w-32 flex-shrink-0 flex flex-col gap-2">
                    <div className="aspect-[2/3] bg-stone-800 rounded-lg overflow-hidden relative border border-stone-700 group">
                        {imageUrl ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageUrl} alt="Wine" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleClearImage}
                                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-600 text-white rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove Image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-600">
                                <span className="text-xs">{t.form.noImage}</span>
                            </div>
                        )}
                    </div>
                    {/* Upload functionality commented out - not going live yet */}
                    {/* <label className="cursor-pointer bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs py-1 px-2 rounded text-center transition-colors">
                        {isUploading ? 'Uploading...' : 'Upload'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} disabled={isUploading} />
                    </label> */}
                </div>

                {/* Text Fields */}
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    name="name"
                                    placeholder={t.form.wineNamePlaceholder}
                                    defaultValue={initialName || ''}
                                    className={`w-full px-3 py-2 bg-stone-800 border ${state?.errors?.name ? 'border-red-500' : 'border-stone-600'} rounded-md text-sm text-stone-100 focus:outline-none focus:border-amber-500`}
                                />
                                {state?.errors?.name && <p className="text-xs text-red-500 mt-1">{state.errors.name}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={handleFetchImage}
                                disabled={isFetching}
                                className="px-3 py-2 bg-stone-800 text-amber-500 border border-amber-500/30 rounded-md hover:bg-stone-700 text-xs font-medium whitespace-nowrap"
                            >
                                {isFetching ? t.form.searching : t.form.autoFetch}
                            </button>
                        </div>
                        {fetchError && (
                            <p className="text-xs text-red-400">{fetchError}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="description"
                            placeholder={t.form.descriptionPlaceholder}
                            defaultValue={initialDescription || ''}
                            className={`w-full px-3 py-2 bg-stone-800 border ${state?.errors?.description ? 'border-red-500' : 'border-stone-600'} rounded-md text-sm text-stone-100 focus:outline-none focus:border-amber-500`}
                        />
                    </div>

                    <div>
                        <select
                            name="broughtBy"
                            defaultValue={initialBroughtBy || ''}
                            className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded-md text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                        >
                            <option value="">{t.presentation.broughtBy} (Optional)</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.username}>
                                    {u.username}
                                </option>
                            ))}
                        </select>
                    </div>



                    <input type="hidden" name="imageUrl" value={imageUrl} />

                    <div className="flex justify-end">
                        <SubmitButton />
                    </div>
                </div>
            </div>
        </form>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    const { t } = useLanguage()
    return (
        <button
            type="submit"
            disabled={pending}
            className="px-6 py-2 bg-amber-600 text-stone-900 text-sm font-bold rounded-md hover:bg-amber-500 transition-colors disabled:opacity-50"
        >
            {pending ? t.form.saving : t.form.saveDetails}
        </button>
    )
}
