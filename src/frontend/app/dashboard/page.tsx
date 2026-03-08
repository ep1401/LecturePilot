import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const firstName =
    user.user_metadata?.full_name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    'there'

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <header className="rounded-[2rem] border border-white/70 bg-white/70 px-6 py-5 shadow-[0_10px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
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

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_10px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
            <p className="text-sm font-medium text-slate-500">Welcome back</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
              Hi, {firstName}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Your study space should feel simple. Create classes, organize lecture material,
              and build a workflow that makes learning smoother.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:scale-[1.01] hover:bg-slate-900 active:scale-[0.99]">
                Create Class
              </button>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                {user.email}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-gradient-to-br from-blue-500 to-violet-500 p-8 text-white shadow-[0_20px_60px_rgba(79,70,229,0.22)]">
            <p className="text-sm font-medium text-white/80">Designed for focus</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              A calmer way to keep up with class.
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/85">
              Clean structure, less friction, and faster access to the things you actually need when studying.
            </p>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Your Classes
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Start with one class and build from there.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-10 shadow-[0_10px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-100 to-violet-100 shadow-inner">
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
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Create your first class to start organizing lectures, notes, and learning materials in a cleaner, more structured way.
              </p>

              <button className="mt-7 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:scale-[1.01] hover:bg-slate-900 active:scale-[0.99]">
                Create your first class
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}