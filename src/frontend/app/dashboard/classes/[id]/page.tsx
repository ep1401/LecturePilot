import Link from 'next/link'
import { fetchClassByIdServer } from '@/lib/api/server-classes'
import DeleteClassButton from './delete-class-button'

export default async function ClassPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const classData = await fetchClassByIdServer(id)

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            ← Back
          </Link>

          <DeleteClassButton classId={classData.id} />
        </div>

        <section className="rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_10px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <p className="text-sm font-medium text-slate-500">Class</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] text-slate-950">
            {classData.name}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">
            Add lecture material, keep resources together, and create a space for asking questions.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-black/5 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
              Upload materials
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Add lecture slides, notes, and class documents here.
            </p>
          </div>

          <div className="rounded-[28px] border border-black/5 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
              Ask question
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Ask questions about course content and build toward searchable study help.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}