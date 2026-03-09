import Link from 'next/link'
import { fetchClassByIdServer } from '@/lib/api/server-classes'
import DeleteClassButton from './delete-class-button'
import UploadMaterialForm from './upload-material-form'
import MaterialsList from './materials-list'
import AskQuestionPanel from './ask-question-panel'

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
            className="inline-flex rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-[#fafafa]"
          >
            ← Back
          </Link>

          <DeleteClassButton classId={classData.id} />
        </div>

        <section className="rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_10px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Class</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] text-slate-950">
                {classData.name}
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">
                Upload lecture material, ask questions about the course, and build a searchable
                workspace around this class.
              </p>
            </div>

            <div className="rounded-[24px] bg-gradient-to-br from-[#7dd3fc] via-[#60a5fa] to-[#818cf8] px-5 py-4 text-white shadow-[0_16px_50px_rgba(96,165,250,0.22)]">
              <p className="text-sm font-medium text-white/80">Learning space</p>
              <p className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                Materials + Q&A
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <UploadMaterialForm classId={classData.id} />
          <MaterialsList classId={classData.id} />
        </section>

        <section className="mt-6">
          <AskQuestionPanel classId={classData.id} />
        </section>
      </div>
    </main>
  )
}