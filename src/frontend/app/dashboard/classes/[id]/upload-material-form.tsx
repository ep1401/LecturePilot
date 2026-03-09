'use client'

import { useState } from 'react'
import { uploadMaterial } from '@/lib/api/materials'

type Props = {
  classId: string
  onUploadComplete?: () => void
}

export default function UploadMaterialForm({
  classId,
  onUploadComplete,
}: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!file) return

    try {
      setUploading(true)
      setError('')
      setMessage('')

      await uploadMaterial(classId, file)

      setMessage('Upload received. Indexing has started.')
      setFile(null)

      const input = document.getElementById('pdf-upload-input') as HTMLInputElement | null
      if (input) input.value = ''

      onUploadComplete?.()
    } catch {
      setError('Could not upload PDF')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Materials</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-950">
            Upload PDF
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Add lecture slides or notes in PDF form. LecturePilot will process and
            index them in the background.
          </p>
        </div>

        <div className="rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-medium text-slate-500">
          PDF
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="rounded-[24px] border border-dashed border-black/10 bg-[#fafafb] p-5">
          <input
            id="pdf-upload-input"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600
              file:mr-4
              file:rounded-full
              file:border-0
              file:bg-slate-950
              file:px-4
              file:py-2
              file:text-sm
              file:font-medium
              file:text-white
              hover:file:bg-slate-900"
          />

          {file && (
            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
              Selected: <span className="font-medium">{file.name}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!file || uploading}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-900 disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>

          <div className="rounded-full border border-black/5 bg-[#fafafb] px-4 py-3 text-sm text-slate-500">
            Slides, notes, and handouts
          </div>
        </div>

        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}