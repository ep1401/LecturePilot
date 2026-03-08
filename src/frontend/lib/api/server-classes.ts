import { createClient } from '@/lib/supabase/server'

const API_BASE = 'http://127.0.0.1:8000/api'

export type ClassItem = {
  id: string
  user_id: string
  name: string
  created_at: string
}

async function getAccessToken() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token
}

export async function fetchClassesServer(): Promise<ClassItem[]> {
  const token = await getAccessToken()

  if (!token) {
    return []
  }

  const res = await fetch(`${API_BASE}/classes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch classes')
  }

  return res.json()
}

export async function fetchClassByIdServer(id: string): Promise<ClassItem> {
  const token = await getAccessToken()

  if (!token) {
    throw new Error('Missing session')
  }

  const res = await fetch(`${API_BASE}/classes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch class')
  }

  return res.json()
}