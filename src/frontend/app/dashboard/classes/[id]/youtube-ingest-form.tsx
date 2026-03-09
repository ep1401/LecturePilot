'use client'

import { useState } from 'react'
import { ingestYouTubeLecture } from '@/lib/api/youtube'

type Props = {
  classId: string
  onComplete?: () => void
}

export default function YouTubeIngestForm({ classId, onComplete }: Props) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!url.trim()) return

    try {
      setLoading(true)
      setError('')
      setMessage('')

      await ingestYouTubeLecture(classId, url.trim(), title.trim() || undefined)

      setMessage('Lecture transcript added successfully.')
      setUrl('')
      setTitle('')
      onComplete?.()
    } catch {
      setError('Could not ingest YouTube lecture')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <p className="text-sm font-medium text-slate-500">Video Lectures</p>
      <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-950">
        Add YouTube lecture
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Paste a YouTube link and LecturePilot will ingest the transcript with timestamps.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Optional title, e.g. Lecture 7"
          className="h-12 w-full rounded-full border border-black/8 bg-[#fafafb] px-5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="h-12 w-full rounded-full border border-black/8 bg-[#fafafb] px-5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-900 disabled:opacity-60"
        >
          {loading ? 'Adding lecture...' : 'Add YouTube lecture'}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  )
}