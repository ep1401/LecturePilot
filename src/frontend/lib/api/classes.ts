import { createClient } from '@/lib/supabase/client'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

if (!API_BASE) {
  throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')
}

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