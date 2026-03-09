'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  classId: string
  className: string
  children: React.ReactNode
}

const navItems = [
  { label: 'Overview', href: '' },
  { label: 'Materials', href: '/materials' },
  { label: 'Ask', href: '/ask' },
  { label: 'Flashcards', href: '/flashcards' },
  { label: 'Quiz', href: '/quiz' },
]

export default function ClassShell({ classId, className, children }: Props) {
  const pathname = usePathname()

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-[#fafafa]"
          >
            ← Back
          </Link>
        </div>

        <section className="rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_10px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Class</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] text-slate-950">
                {className}
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">
                A clean workspace for materials, questions, study tools, and future learning features.
              </p>
            </div>

            <div className="rounded-[24px] bg-gradient-to-br from-[#7dd3fc] via-[#60a5fa] to-[#818cf8] px-5 py-4 text-white shadow-[0_16px_50px_rgba(96,165,250,0.22)]">
              <p className="text-sm font-medium text-white/80">Workspace</p>
              <p className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                Structured for learning
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const href = `/dashboard/classes/${classId}${item.href}`
              const active =
                pathname === href ||
                (item.href === '' && pathname === `/dashboard/classes/${classId}`)

              return (
                <Link
                  key={item.label}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'border border-black/5 bg-white text-slate-600 hover:bg-[#fafafa]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mt-6">{children}</section>
      </div>
    </main>
  )
}