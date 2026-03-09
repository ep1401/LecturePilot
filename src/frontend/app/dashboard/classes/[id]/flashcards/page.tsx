import FlashcardsPanel from './flashcards-panel'

export default async function ClassFlashcardsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <FlashcardsPanel classId={id} />
}