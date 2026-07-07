import { CastScheduleSection } from '@/components/tiara/CastScheduleSection'
import { StitchShell } from '@/components/tiara/StitchShell'
import { TiaraHomeAccess } from '@/components/tiara/TiaraHomeAccess'
import { TiaraHomePayment } from '@/components/tiara/TiaraHomePayment'
import { TiaraHomePricing } from '@/components/tiara/TiaraHomePricing'
import { getAllTiaraCasts } from '@/lib/tiara-casts'
import { businessToday } from '@/lib/business-date'

export default async function HomePage() {
  const today = businessToday()
  const casts = await getAllTiaraCasts()

  return (
    <StitchShell active="home">
      <CastScheduleSection casts={casts} today={today} />
      <TiaraHomePricing />
      <TiaraHomeAccess />
      <TiaraHomePayment />
    </StitchShell>
  )
}
