import { fetchClassByIdServer } from '@/lib/api/server-classes'
import ClassShell from './class-shell'

export default async function ClassLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const classData = await fetchClassByIdServer(id)

  return (
    <ClassShell classId={classData.id} className={classData.name}>
      {children}
    </ClassShell>
  )
}