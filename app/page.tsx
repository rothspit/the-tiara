import { CastScheduleSection } from '@/components/tiara/CastScheduleSection'
import { StitchShell } from '@/components/tiara/StitchShell'
import { getAllTiaraCasts } from '@/lib/tiara-casts'

function businessToday(): string {
  const now = new Date()
  now.setHours(now.getHours() - 8)
  return now.toISOString().slice(0, 10)
}

export default async function HomePage() {
  const today = businessToday()
  const casts = await getAllTiaraCasts()

  return (
    <StitchShell active="home">
      <CastScheduleSection casts={casts} today={today} />
    </StitchShell>
  )
}
