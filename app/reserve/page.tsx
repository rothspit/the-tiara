import { TiaraReserveChat } from '@/components/tiara/TiaraReserveChat'
import { getAllTiaraCasts } from '@/lib/tiara-casts'

export default async function ReservePage() {
  const casts = await getAllTiaraCasts()

  const options = casts
    .filter((c) => !c.isPlaceholder)
    .map((c) => ({
      id: c.id,
      name: c.name,
      crm_cast_id: c.id,
    }))

  return <TiaraReserveChat casts={options} />
}
