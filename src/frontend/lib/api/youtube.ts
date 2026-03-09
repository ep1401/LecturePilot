import { createClient } from '@/lib/supabase/client'

const API_BASE = 'http://127.0.0.1:8000/api'

async function getAccessToken() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token
}

export async function ingestYouTubeLecture(
  classId: string,
  url: string,
  title?: string
) {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}/classes/${classId}/youtube`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, title }),
  })

  if (!res.ok) {
    throw new Error('Failed to ingest YouTube lecture')
  }

  return res.json()
}