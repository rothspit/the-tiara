import Image from 'next/image'
import Link from 'next/link'
import type { TiaraCast } from '@/lib/tiara-casts/types'
import { getCastTodayHours } from '@/lib/tiara-casts'
import { tiaraWaitStatusBadge } from '@/lib/wait-status'

type Props = {
  cast: TiaraCast
  today?: string
}

export function CastCard({ cast, today }: Props) {
  const hours = getCastTodayHours(cast, today)
  const todayKey = today ?? ''
  const slot = todayKey ? cast.schedule[todayKey] : undefined
  const waitBadge = slot ? tiaraWaitStatusBadge(slot.waitStatus, slot.attendEndTime) : null
  const inner = (
    <>
      <div className="relative h-80 overflow-hidden bg-gray-100">
        {waitBadge && (
          <div
            className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-[10px] ${waitBadge.className}`}
          >
            {waitBadge.label}
          </div>
        )}
        <Image
          src={cast.image}
          alt={cast.name}
          fill
          className="object-cover object-top"
          sizes="256px"
          unoptimized={cast.image.startsWith('/cast/')}
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-on-surface">
          {cast.name}{' '}
          <span className="text-sm font-normal text-secondary">（{cast.age}歳）</span>
        </h3>
        {hours && (
          <p className="text-sm font-bold text-primary mt-1">{hours}</p>
        )}
        {cast.message && (
          <p className="text-xs text-secondary mt-1 line-clamp-2">{cast.message}</p>
        )}
        {cast.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {cast.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="bg-primary-container text-[10px] px-2 py-1 rounded text-on-primary-container"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )

  if (cast.isPlaceholder) {
    return (
      <div className="flex-shrink-0 w-64 rounded-xl overflow-hidden bg-white border border-outline-subtle shadow-sm opacity-95">
        {inner}
      </div>
    )
  }

  return (
    <Link
      href={`/cast/${cast.id}`}
      className="flex-shrink-0 w-64 rounded-xl overflow-hidden bg-white border border-outline-subtle shadow-sm hover:border-primary transition-colors"
    >
      {inner}
    </Link>
  )
}
