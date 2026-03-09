import { createClient } from '@/lib/supabase/client'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

if (!API_BASE) {
  throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')
}

export type FlashcardSource = {
  material_name: string
  page_number: number | null
  timestamp_seconds: number | null
  chunk_id: string | null
}

export type Flashcard = {
  id: string
  class_id: string
  material_id: string | null
  front: string
  back: string
  starred: boolean
  sources: FlashcardSource[]
}

async function getAccessToken() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token
}

export async function fetchFlashcards(
  classId: string,
  scope: 'global' | 'material' | 'starred',
  materialId?: string | null
): Promise<Flashcard[]> {
  const token = await getAccessToken()

  const params = new URLSearchParams({ scope })
  if (scope === 'material' && materialId) {
    params.set('material_id', materialId)
  }

  const res = await fetch(`${API_BASE}/classes/${classId}/flashcards?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to fetch flashcards')
  }

  return data
}

export async function toggleFlashcardStar(flashcardId: string, starred: boolean) {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}/flashcards/${flashcardId}/star`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ starred }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to update star')
  }

  return data
}