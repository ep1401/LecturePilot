import { createClient } from '@/lib/supabase/client'

const API_BASE = 'http://127.0.0.1:8000/api'

async function getAccessToken() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token
}

export async function deleteClass(id: string) {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to delete class')
  }
}