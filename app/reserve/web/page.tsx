import { TiaraReserveChat } from '@/components/tiara/TiaraReserveChat'
import { getAllTiaraCasts } from '@/lib/tiara-casts'

type Props = {
  searchParams: Promise<{ cast?: string }>
}

export default async function ReserveWebPage({ searchParams }: Props) {
  const { cast: preselectedCastId } = await searchParams
  const casts = await getAllTiaraCasts()

  const options = casts
    .filter((c) => !c.isPlaceholder)
    .map((c) => ({
      id: c.id,
      name: c.name,
      crm_cast_id: c.id,
    }))

  return <TiaraReserveChat casts={options} preselectedCastId={preselectedCastId ?? null} />
}
