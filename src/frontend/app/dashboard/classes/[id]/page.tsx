import DeleteClassButton from './delete-class-button'

export default async function ClassOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-medium text-slate-500">Overview</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
          Class workspace
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">
          Use the sections above to manage materials, ask questions, and later generate study tools like flashcards and quizzes.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] bg-[#f8f8fa] p-5">
            <p className="text-sm font-medium text-slate-500">Materials</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Upload lecture PDFs and ingest YouTube lecture transcripts.
            </p>
          </div>

          <div className="rounded-[24px] bg-[#f8f8fa] p-5">
            <p className="text-sm font-medium text-slate-500">Ask</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Ask questions using only indexed course material and receive cited answers.
            </p>
          </div>

          <div className="rounded-[24px] bg-[#f8f8fa] p-5">
            <p className="text-sm font-medium text-slate-500">Flashcards</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Generate study cards from lecture material as you expand the app.
            </p>
          </div>

          <div className="rounded-[24px] bg-[#f8f8fa] p-5">
            <p className="text-sm font-medium text-slate-500">Quiz</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Turn class content into practice questions and review sessions.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-medium text-slate-500">Settings</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
          Manage class
        </h2>
        <p className="mt-4 text-[15px] leading-7 text-slate-600">
          Delete this class and all associated materials if you no longer need it.
        </p>

        <div className="mt-8">
          <DeleteClassButton classId={id} />
        </div>
      </div>
    </div>
  )
}