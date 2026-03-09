import { createClient } from '@/lib/supabase/client'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

if (!API_BASE) {
  throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')
}

export type QuizSource = {
  material_name: string
  page_number: number | null
  timestamp_seconds: number | null
  chunk_id: string | null
}

export type QuizQuestion = {
  question_type: 'multiple_choice' | 'short_answer'
  prompt: string
  options: string[]
  correct_answer: string
  explanation: string
  sources: QuizSource[]
}

export type QuizGradeResult = {
  is_correct: boolean
  feedback: string
  correct_answer: string
  explanation: string
  sources: QuizSource[]
}

async function getAccessToken() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token
}

export async function generateQuizQuestion(classId: string): Promise<{ question: QuizQuestion }> {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}/classes/${classId}/quiz/question`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to generate question')
  }

  return data
}

export async function gradeQuizQuestion(
  classId: string,
  question: QuizQuestion,
  userAnswer: string
): Promise<QuizGradeResult> {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}/classes/${classId}/quiz/grade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      question,
      user_answer: userAnswer,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to grade question')
  }

  return data
}