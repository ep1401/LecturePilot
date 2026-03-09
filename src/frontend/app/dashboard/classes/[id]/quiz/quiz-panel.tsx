'use client'

import { useEffect, useState } from 'react'
import {
  generateQuizQuestion,
  gradeQuizQuestion,
  QuizGradeResult,
  QuizQuestion,
} from '@/lib/api/quiz'

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

function LoadingState() {
  return (
    <div className="mt-8 space-y-5">
      <div className="rounded-[24px] bg-[#f8f8fa] p-6">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-10 w-3/4 animate-pulse rounded-2xl bg-slate-200" />
      </div>

      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[60px] animate-pulse rounded-[22px] bg-slate-100"
          />
        ))}
      </div>
    </div>
  )
}

export default function QuizPanel({ classId }: { classId: string }) {
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [typedAnswer, setTypedAnswer] = useState('')
  const [result, setResult] = useState<QuizGradeResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [questionNumber, setQuestionNumber] = useState(1)

  async function loadQuestion(increment = false) {
    try {
      setLoading(true)
      setError('')
      setResult(null)
      setSelectedAnswer('')
      setTypedAnswer('')

      const data = await generateQuizQuestion(classId)
      setQuestion(data.question)

      if (increment) {
        setQuestionNumber((prev) => prev + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load quiz question')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestion(false)
  }, [classId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question) return

    const answer =
      question.question_type === 'multiple_choice' ? selectedAnswer : typedAnswer.trim()

    if (!answer) return

    try {
      setSubmitting(true)
      setError('')
      const graded = await gradeQuizQuestion(classId, question, answer)
      setResult(graded)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not grade answer')
    } finally {
      setSubmitting(false)
    }
  }

  function getOptionStyles(option: string) {
    if (!result) {
      const active = selectedAnswer === option
      return active
        ? 'border-slate-900 bg-slate-950 text-white'
        : 'border-black/5 bg-white text-slate-800 hover:bg-[#fafafa]'
    }

    const isCorrect = option === result.correct_answer
    const isSelected = option === selectedAnswer

    if (isCorrect) {
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    }

    if (isSelected && !result.is_correct) {
      return 'border-red-200 bg-red-50 text-red-700'
    }

    return 'border-black/5 bg-white text-slate-500'
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Quiz</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Practice one question at a time
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
              Answer a generated question, get immediate feedback, and see exactly where it came from.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#f5f5f7] px-4 py-2 text-sm font-medium text-slate-600">
              Question {questionNumber}
            </div>

            <button
              onClick={() => loadQuestion(true)}
              disabled={loading || submitting}
              className="rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-[#fafafa] disabled:opacity-60"
            >
              Next Question
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <p className="mt-6 text-sm text-red-600">{error}</p>
        ) : question ? (
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="rounded-[24px] bg-[#f8f8fa] p-6">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
                {question.question_type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'}
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                {question.prompt}
              </h3>
            </div>

            {question.question_type === 'multiple_choice' ? (
              <div className="mt-6 grid gap-3">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => !result && setSelectedAnswer(option)}
                    disabled={!!result}
                    className={`rounded-[22px] border px-5 py-4 text-left text-[15px] font-medium transition ${getOptionStyles(option)}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <textarea
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={!!result}
                  className="min-h-[140px] w-full rounded-[24px] border border-black/8 bg-[#fafafb] px-5 py-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-80"
                />
              </div>
            )}

            {!result && (
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    (question.question_type === 'multiple_choice'
                      ? !selectedAnswer
                      : !typedAnswer.trim())
                  }
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-900 disabled:opacity-60"
                >
                  {submitting ? 'Checking...' : 'Submit Answer'}
                </button>
              </div>
            )}

            {result && (
              <div className="mt-6 space-y-4">
                <div
                  className={`rounded-[24px] px-5 py-4 ${
                    result.is_correct
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold">
                      {result.is_correct ? 'Correct' : 'Incorrect'}
                    </div>
                    <div className="text-sm">{result.feedback}</div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[24px] bg-[#f8f8fa] p-5">
                    <p className="text-sm font-medium text-slate-500">Correct answer</p>
                    <p className="mt-2 text-[15px] leading-7 text-slate-900">
                      {result.correct_answer}
                    </p>
                  </div>

                  <div className="rounded-[24px] bg-[#f8f8fa] p-5">
                    <p className="text-sm font-medium text-slate-500">Explanation</p>
                    <p className="mt-2 text-[15px] leading-7 text-slate-900">
                      {result.explanation}
                    </p>
                  </div>
                </div>

                {result.sources.length > 0 && (
                  <div className="rounded-[24px] bg-[#f8f8fa] p-5">
                    <p className="text-sm font-medium text-slate-500">Sources</p>
                    <div className="mt-3 space-y-2">
                      {result.sources.map((source, idx) => (
                        <div
                          key={`${source.chunk_id ?? idx}-${idx}`}
                          className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-slate-700"
                        >
                          {formatSource(source)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => loadQuestion(true)}
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-900"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : null}
      </div>
    </div>
  )
}