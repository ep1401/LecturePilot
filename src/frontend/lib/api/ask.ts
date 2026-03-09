import { createClient } from '@/lib/supabase/client'

const API_BASE = 'http://127.0.0.1:8000/api'

async function getAccessToken() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token
}

export async function askQuestion(classId: string, question: string) {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}/classes/${classId}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question }),
  })

  if (!res.ok) {
    throw new Error('Failed to ask question')
  }

  return res.json()
}