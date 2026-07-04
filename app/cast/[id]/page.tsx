import { notFound } from 'next/navigation'
import { CastProfile } from '@/components/tiara/CastProfile'
import { StitchShell } from '@/components/tiara/StitchShell'
import { getTiaraCastById } from '@/lib/tiara-casts'

type Props = {
  params: Promise<{ id: string }>
}

export default async function CastDetailPage({ params }: Props) {
  const { id } = await params
  const cast = await getTiaraCastById(id)

  if (!cast) {
    notFound()
  }

  return (
    <StitchShell active="cast">
      <CastProfile cast={cast} />
    </StitchShell>
  )
}
