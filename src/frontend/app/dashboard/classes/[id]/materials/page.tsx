import UploadMaterialForm from '../upload-material-form'
import MaterialsList from '../materials-list'
import YouTubeIngestForm from '../youtube-ingest-form'

export default async function ClassMaterialsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4">
        <UploadMaterialForm classId={id} />
        <YouTubeIngestForm classId={id} />
      </div>

      <MaterialsList classId={id} />
    </div>
  )
}