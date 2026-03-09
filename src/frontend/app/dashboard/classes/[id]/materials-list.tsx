'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMaterials, MaterialItem } from '@/lib/api/materials'
import DeleteMaterialButton from './delete-material-button'

type Props = {
  classId: string
}

function StatusBadge({ status }: { status: MaterialItem['status'] }) {
  const styles: Record<MaterialItem['status'], string> = {
    queued: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
  }

  const labels: Record<MaterialItem['status'], string> = {
    queued: 'Queued',
    processing: 'Processing',
    completed: 'Ready',
    failed: 'Failed',
  }

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function MaterialsList({ classId }: Props) {
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMaterials = useCallback(async () => {
    try {
      const data = await fetchMaterials(classId)
      setMaterials(data)
      setError('')
    } catch {
      setError('Could not load materials')
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    loadMaterials()
  }, [loadMaterials])

  const hasActiveJobs = useMemo(
    () => materials.some((m) => m.status === 'queued' || m.status === 'processing'),
    [materials]
  )

  useEffect(() => {
    if (!hasActiveJobs) return

    const interval = setInterval(() => {
      loadMaterials()
    }, 3000)

    return () => clearInterval(interval)
  }, [hasActiveJobs, loadMaterials])

  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Indexed Content</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-950">
            Materials
          </h2>
        </div>

        {hasActiveJobs && (
          <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Updating…
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[92px] animate-pulse rounded-[22px] bg-[#f6f7f8]"
            />
          ))}
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-red-600">{error}</p>
      ) : materials.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-black/10 bg-[#fafafb] px-6 py-10 text-center">
          <p className="text-base font-medium text-slate-900">No materials yet</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload a PDF to start building a searchable class workspace.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {materials.map((material) => (
            <div
              key={material.id}
              className="rounded-[24px] border border-black/5 bg-[#fcfcfd] px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[15px] font-medium text-slate-950">
                      {material.name}
                    </p>
                    <StatusBadge status={material.status} />
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Uploaded {formatDate(material.created_at)}
                  </p>

                  {material.status === 'failed' && material.error_message && (
                    <p className="mt-2 text-sm text-red-600">
                      {material.error_message}
                    </p>
                  )}
                </div>

                <DeleteMaterialButton
                  classId={classId}
                  materialId={material.id}
                  materialName={material.name}
                  onDeleted={loadMaterials}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}