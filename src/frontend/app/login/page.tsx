'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f5f7] text-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-[-8rem] top-[6rem] h-[22rem] w-[22rem] rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[20%] h-[24rem] w-[24rem] rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="px-2 lg:px-6">
            <div className="inline-flex items-center rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-xl">
              LecturePilot
            </div>

            <h1 className="mt-8 max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl">
              Learning should feel clear, focused, and actually enjoyable.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              LecturePilot helps students keep classes organized, revisit lectures faster,
              and build a workspace that feels calm instead of overwhelming.
            </p>

            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-white/60 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <p className="text-sm font-medium text-slate-500">Organized</p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  Keep every class in one clean place
                </p>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/60 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <p className="text-sm font-medium text-slate-500">Searchable</p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  Find what was covered faster
                </p>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/60 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <p className="text-sm font-medium text-slate-500">Student-first</p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  Built to make studying easier
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-10">
              <div>
                <p className="text-sm font-medium text-slate-500">Welcome</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
                  Sign in to continue
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Access your classes, lecture spaces, and study workflow in one place.
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:scale-[1.01] hover:bg-slate-900 active:scale-[0.99]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-5 w-5 rounded-full bg-white"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5Z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7Z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2c-2.1 1.6-4.7 2.4-7.3 2.4-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 39.6 16.2 44 24 44Z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l.1-.1 6.2 5.2C37.2 38.4 44 33 44 24c0-1.2-.1-2.3-.4-3.5Z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="mt-8 rounded-2xl bg-slate-50/80 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Why students like it
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Less clutter, less hunting through notes, and a cleaner place to stay on top of every class.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}