'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

if (!API_BASE) {
  throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')
}

export default function CreateClassForm() {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmed = name.trim()
    if (!trimmed) return

    try {
      setCreating(true)
      setError('')

      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch(`${API_BASE}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ name: trimmed }),
      })

      if (!res.ok) {
        throw new Error('Failed to create class')
      }

      setName('')
      router.refresh()
    } catch {
      setError('Could not create class')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/80 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter class name"
          className="h-12 flex-1 rounded-full border border-black/8 bg-[#f7f7f8] px-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-black/15 focus:bg-white"
        />
        <button
          type="submit"
          disabled={creating}
          className="h-12 rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-900 disabled:opacity-60"
        >
          {creating ? 'Creating...' : 'Create Class'}
        </button>
      </form>

      {error && <p className="px-2 pt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}