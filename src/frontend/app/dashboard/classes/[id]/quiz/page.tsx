export default function ClassQuizPage() {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <p className="text-sm font-medium text-slate-500">Quiz</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
        Quiz generation coming next
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">
        This section will create practice quizzes based on lecture materials, transcripts, and indexed class content.
      </p>

      <div className="mt-8 rounded-[24px] bg-[#f8f8fa] p-6">
        <p className="text-sm text-slate-500">
          Planned features: multiple choice, short answer, difficulty levels, and instant feedback.
        </p>
      </div>
    </div>
  )
}