import QuizPanel from './quiz-panel'

export default async function ClassQuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <QuizPanel classId={id} />
}