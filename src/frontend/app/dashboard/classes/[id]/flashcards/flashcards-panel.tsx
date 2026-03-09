'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  fetchFlashcards,
  Flashcard,
  toggleFlashcardStar,
} from '@/lib/api/flashcards'
import { fetchMaterials, MaterialItem } from '@/lib/api/materials'

function formatSource(source: {
  material_name: string
  page_number: number | null
  timestamp_seconds: number | null
}) {
  if (source.timestamp_seconds != null) {
    const minutes = Math.floor(source.timestamp_seconds / 60)
    const seconds = source.timestamp_seconds % 60
    return `${source.material_name} — ${minutes}:${String(seconds).padStart(2, '0')}`
  }

  if (source.page_number != null) {
    return `${source.material_name} p. ${source.page_number}`
  }

  return source.material_name
}

type Scope = 'global' | 'material' | 'starred'

function LoadingCard() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="h-11 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-11 w-24 animate-pulse rounded-full bg-slate-200" />
        </div>

        <div className="h-[480px] animate-pulse rounded-[34px] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]" />

        <div className="mt-4 flex items-center justify-between">
          <div className="h-11 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-11 w-24 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="h-[480px] animate-pulse rounded-[30px] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]" />
    </div>
  )
}

export default function FlashcardsPanel({ classId }: { classId: string }) {
  const [scope, setScope] = useState<Scope>('global')
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('')
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const [error, setError] = useState('')
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  async function loadMaterials() {
    try {
      setLoadingMaterials(true)
      const data = await fetchMaterials(classId)
      const readyMaterials = data.filter((m) => m.status === 'completed')
      setMaterials(readyMaterials)

      if (!selectedMaterialId && readyMaterials.length > 0) {
        setSelectedMaterialId(readyMaterials[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load materials')
    } finally {
      setLoadingMaterials(false)
    }
  }

  async function loadCards(nextScope = scope, nextMaterialId = selectedMaterialId) {
    try {
      setLoading(true)
      setError('')

      const materialId =
        nextScope === 'material' && nextMaterialId ? nextMaterialId : null

      const data = await fetchFlashcards(classId, nextScope, materialId)

      setCards(data)
      setIndex(0)
      setFlipped(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load flashcards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMaterials()
  }, [classId])

  useEffect(() => {
    if (scope === 'material' && !selectedMaterialId) return
    loadCards(scope, selectedMaterialId)
  }, [classId, scope, selectedMaterialId])

  async function handleToggleStar(card: Flashcard) {
    try {
      await toggleFlashcardStar(card.id, !card.starred)

      if (scope === 'starred' && card.starred) {
        const nextCards = cards.filter((c) => c.id !== card.id)
        setCards(nextCards)

        if (nextCards.length === 0) {
          setIndex(0)
        } else if (index >= nextCards.length) {
          setIndex(0)
        }
      } else {
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, starred: !c.starred } : c))
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update star')
    }
  }

  const currentCard = useMemo(() => cards[index] ?? null, [cards, index])

  function goPrev() {
    if (cards.length === 0) return
    setFlipped(false)
    setIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  function goNext() {
    if (cards.length === 0) return
    setFlipped(false)
    setIndex((prev) => (prev + 1) % cards.length)
  }

  const scopeLabel =
    scope === 'global'
      ? 'All Class Flashcards'
      : scope === 'material'
      ? 'Document Flashcards'
      : 'Starred'

  const currentMaterialName =
    scope === 'material'
      ? materials.find((m) => m.id === selectedMaterialId)?.source_label ||
        materials.find((m) => m.id === selectedMaterialId)?.name ||
        'Selected document'
      : null

  return (
    <div className="grid gap-5">
      <div className="rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_12px_50px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Flashcards</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Study one card at a time
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
              Review your class as a full set, drill into one document, or focus only on your starred cards.
            </p>
          </div>

          <div className="rounded-[24px] bg-gradient-to-br from-[#7dd3fc] via-[#60a5fa] to-[#818cf8] px-5 py-4 text-white shadow-[0_16px_50px_rgba(96,165,250,0.22)]">
            <p className="text-sm font-medium text-white/80">Mode</p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.02em]">
              {scopeLabel}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit rounded-full border border-black/5 bg-[#f7f7f8] p-1 shadow-inner">
            {(['global', 'material', 'starred'] as Scope[]).map((item) => {
              const active = scope === item
              return (
                <button
                  key={item}
                  onClick={() => setScope(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item === 'global'
                    ? 'Global'
                    : item === 'material'
                    ? 'Per Document'
                    : 'Starred'}
                </button>
              )
            })}
          </div>

          {scope === 'material' && (
            <div className="w-full max-w-sm">
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="h-12 w-full rounded-full border border-black/8 bg-white px-4 text-sm text-slate-900 outline-none shadow-sm"
                disabled={loadingMaterials || materials.length === 0}
              >
                {materials.length === 0 ? (
                  <option value="">No documents available</option>
                ) : (
                  materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.source_label || material.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-[#f5f5f7] px-4 py-2 text-sm font-medium text-slate-600">
            {scopeLabel}
          </div>

          {scope === 'material' && currentMaterialName && (
            <div className="rounded-full border border-black/5 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              {currentMaterialName}
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-8">
            <LoadingCard />
          </div>
        ) : error ? (
          <p className="mt-8 text-sm text-red-600">{error}</p>
        ) : cards.length === 0 ? (
          <div className="mt-8 rounded-[30px] bg-[#f8f8fa] px-8 py-14 text-center">
            <p className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
              No flashcards yet
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
              {scope === 'material'
                ? 'Select a processed document to view its flashcards.'
                : scope === 'starred'
                ? 'Star flashcards to save them here.'
                : 'Upload materials and flashcards will appear automatically.'}
            </p>
          </div>
        ) : currentCard ? (
          <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="rounded-full bg-[#f5f5f7] px-4 py-2 text-sm font-medium text-slate-600">
                  Card {index + 1} of {cards.length}
                </div>

                <button
                  onClick={() => handleToggleStar(currentCard)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    currentCard.starred
                      ? 'bg-amber-50 text-amber-700'
                      : 'border border-black/5 bg-white text-slate-600 shadow-sm hover:bg-[#fafafa]'
                  }`}
                >
                  {currentCard.starred ? '★ Starred' : '☆ Star'}
                </button>
              </div>

              <button
                onClick={() => setFlipped((prev) => !prev)}
                className="group relative h-[500px] w-full rounded-[36px] text-left [perspective:1400px]"
              >
                <div
                  className={`relative h-full w-full rounded-[36px] transition-transform duration-500 [transform-style:preserve-3d] ${
                    flipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  <div className="absolute inset-0 rounded-[36px] border border-black/5 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] [backface-visibility:hidden]">
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">Front</p>
                        <div className="rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-medium text-slate-500">
                          Tap to flip
                        </div>
                      </div>

                      <div className="flex flex-1 items-center justify-center px-4">
                        <h3 className="max-w-3xl text-center text-[42px] font-semibold leading-[1.1] tracking-[-0.05em] text-slate-950">
                          {currentCard.front}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-[36px] border border-black/5 bg-[#f8f8fa] p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">Back</p>
                        <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                          Tap to flip back
                        </div>
                      </div>

                      <div className="flex flex-1 items-center justify-center px-6">
                        <p className="max-w-3xl text-center text-[22px] leading-9 text-slate-900">
                          {currentCard.back}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={goPrev}
                  className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-[#fafafa]"
                >
                  Previous
                </button>

                <button
                  onClick={goNext}
                  className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-900"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-medium text-slate-500">Sources</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Current card references
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Where this flashcard came from in your class materials.
              </p>

              {currentCard.sources.length === 0 ? (
                <div className="mt-6 rounded-[24px] bg-[#f8f8fa] px-5 py-6 text-sm text-slate-500">
                  No sources attached.
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {currentCard.sources.map((source, idx) => (
                    <div
                      key={`${source.chunk_id ?? idx}-${idx}`}
                      className="rounded-[22px] border border-black/5 bg-[#fcfcfd] px-4 py-4 text-sm text-slate-700 shadow-sm"
                    >
                      {formatSource(source)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}