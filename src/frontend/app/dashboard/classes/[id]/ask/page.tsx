import AskQuestionPanel from '../ask-question-panel'

export default async function ClassAskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="grid gap-4">
      <AskQuestionPanel classId={id} />
    </div>
  )
}