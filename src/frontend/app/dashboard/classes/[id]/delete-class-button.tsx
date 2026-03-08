'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteClass } from '@/lib/api/classes'

export default function DeleteClassButton({ classId }: { classId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this class? This cannot be undone.'
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      setError('')
      await deleteClass(classId)
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Could not delete class')
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
      >
        {deleting ? 'Deleting...' : 'Delete Class'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}