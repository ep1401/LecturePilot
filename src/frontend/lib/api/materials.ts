import { createClient } from '@/lib/supabase/client'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

if (!API_BASE) {
  throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')
}

export type MaterialItem = {
  id: string
  class_id: string
  type: 'pdf' | 'notes'
  source_type?: 'pdf' | 'notes' | 'youtube'
  name: string
  source_label?: string | null
  external_url?: string | null
  storage_path: string | null
  status: 'queued' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at?: string
}

async function getAccessToken() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token
}

export async function fetchMaterials(classId: string): Promise<MaterialItem[]> {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}/classes/${classId}/materials`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch materials')
  }

  return res.json()
}

export async function uploadMaterial(classId: string, file: File) {
  const token = await getAccessToken()

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/classes/${classId}/materials/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    throw new Error('Failed to upload material')
  }

  return res.json()
}

export async function deleteMaterial(classId: string, materialId: string) {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}/classes/${classId}/materials/${materialId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to delete material')
  }
}