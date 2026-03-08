export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="h-[92px] animate-pulse rounded-[32px] bg-white/70 shadow-sm" />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-[280px] animate-pulse rounded-[32px] bg-white/70 shadow-sm" />
          <div className="h-[280px] animate-pulse rounded-[32px] bg-white/70 shadow-sm" />
        </div>

        <div className="mt-6 rounded-[32px] bg-white/70 p-8 shadow-sm">
          <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded-xl bg-slate-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[150px] animate-pulse rounded-[28px] bg-white shadow-sm"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}