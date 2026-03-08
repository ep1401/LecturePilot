import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchClassesServer } from '@/lib/api/server-classes'
import LogoutButton from './logout-button'
import CreateClassForm from './create-class-form'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const classes = await fetchClassesServer()

  const firstName =
    user.user_metadata?.full_name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    'there'

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <header className="rounded-[32px] border border-white/70 bg-white/70 px-7 py-6 shadow-[0_10px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">LecturePilot</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Dashboard
              </h1>
            </div>
            <LogoutButton />
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_10px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
            <p className="text-sm font-medium text-slate-500">Welcome back</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-[-0.045em] text-slate-950">
              Hi, {firstName}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">
              Keep each course organized in one place and build a cleaner study workflow
              around your lecture material.
            </p>

            <div className="mt-8">
              <CreateClassForm />
            </div>
          </div>

          <div className="rounded-[32px] bg-gradient-to-br from-[#7dd3fc] via-[#60a5fa] to-[#818cf8] p-8 text-white shadow-[0_18px_60px_rgba(96,165,250,0.28)]">
            <p className="text-sm font-medium text-white/80">Built for learning</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
              Calm, structured, and easy to come back to.
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/90">
              LecturePilot is designed to make school feel less cluttered and more manageable.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_10px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950">
                Your Classes
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Open a class to manage materials and questions.
              </p>
            </div>
          </div>

          {classes.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-black/10 bg-white/70 px-8 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#f2f4f7]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.75v14.5m7.25-7.25H4.75"
                  />
                </svg>
              </div>

              <h4 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                No classes yet
              </h4>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Create your first class to start organizing lectures, notes, and other materials.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {classes.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/dashboard/classes/${cls.id}`}
                  className="group rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                        {cls.name}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">Open class</p>
                    </div>

                    <div className="rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-medium text-slate-500">
                      Class
                    </div>
                  </div>

                  <div className="mt-6 h-px bg-black/5" />

                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>Workspace</span>
                    <span className="transition group-hover:translate-x-0.5">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}