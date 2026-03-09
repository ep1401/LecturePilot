'use client'

import { useState } from 'react'
import { askQuestion } from '@/lib/api/ask'

type Props = {
  classId: string
}

type Source = {
  material_name: string
  page_number: number | null
  timestamp_seconds: number | null
  chunk_id: string
}

function formatTimestamp(seconds: number | null) {
  if (seconds == null) return null
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}:${String(remaining).padStart(2, '0')}`
}

export default function AskQuestionPanel({ classId }: Props) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [error, setError] = useState('')

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()

    if (!question.trim()) return

    try {
      setLoading(true)
      setError('')
      setAnswer('')
      setSources([])

      const result = await askQuestion(classId, question.trim())

      setAnswer(result.answer)
      setSources(result.sources || [])
    } catch {
      setError('Could not get an answer right now')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <p className="text-sm font-medium text-slate-500">Ask</p>
      <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-950">
        Ask a question about this class
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        LecturePilot will answer using only indexed course materials.
      </p>

      <form onSubmit={handleAsk} className="mt-6">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What did the professor say about max flow, shortest paths, or NP-completeness?"
          className="min-h-[120px] w-full rounded-[24px] border border-black/8 bg-[#fafafb] px-5 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-900 disabled:opacity-60"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {(answer || loading) && (
        <div className="mt-6 rounded-[24px] bg-[#fcfcfd] px-5 py-5">
          <p className="text-sm font-medium text-slate-500">Answer</p>
          <div className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-800">
            {loading ? 'Generating answer...' : answer}
          </div>

          {!loading && sources.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-500">Sources</p>
              <div className="mt-3 space-y-2">
                {sources.map((source, idx) => {
                    const ts = formatTimestamp(source.timestamp_seconds)

                    return (
                      <div
                        key={`${source.chunk_id}-${idx}`}
                        className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-slate-700"
                      >
                        {source.material_name}
                        {ts ? ` — ${ts}` : source.page_number ? ` p. ${source.page_number}` : ''}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}