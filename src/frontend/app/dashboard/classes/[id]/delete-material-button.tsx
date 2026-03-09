'use client'

import { useState } from 'react'
import { deleteMaterial } from '@/lib/api/materials'

type Props = {
  classId: string
  materialId: string
  materialName: string
  onDeleted?: () => void
}

export default function DeleteMaterialButton({
  classId,
  materialId,
  materialName,
  onDeleted,
}: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${materialName}"?\n\nThis will also remove all indexed chunks for this file.`
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      await deleteMaterial(classId, materialId)
      onDeleted?.()
    } catch {
      alert('Could not delete material')
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-60"
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}