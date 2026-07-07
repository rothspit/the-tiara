import Image from 'next/image'
import Link from 'next/link'
import type { TiaraCast } from '@/lib/tiara-casts/types'
import { formatJapaneseDate, getCastTodayHours } from '@/lib/tiara-casts'
import { businessToday } from '@/lib/business-date'

type Props = {
  cast: TiaraCast
}

export function CastProfile({ cast }: Props) {
  const scheduleDates = Object.keys(cast.schedule).sort()
  const today = businessToday()
  const todayHours = getCastTodayHours(cast, today)

  return (
    <div className="bg-white min-h-screen">
      <div className="relative h-[min(70vh,520px)] w-full bg-gray-100">
        <Image
          src={cast.image}
          alt={cast.name}
          fill
          className="object-cover object-top"
          sizes="100vw"
          priority
          unoptimized={cast.image.startsWith('/cast/')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <p className="text-xs tracking-[0.2em] uppercase text-white/80 mb-2">Therapist Profile</p>
          <h1 className="text-3xl md:text-4xl font-bold">{cast.name}</h1>
          <p className="text-white/90 mt-2 text-sm">
            {cast.age}歳
            {cast.height ? ` / T${cast.height}` : ''}
            {cast.tag ? ` / ${cast.tag}` : ''}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10 pb-28">
        <div className="bg-white rounded-2xl border shadow-lg p-6 md:p-8 mb-6">
          {todayHours && (
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center gap-1 bg-primary-container text-primary px-4 py-2 rounded-full text-sm font-bold">
                <span className="material-symbols-outlined text-base">schedule</span>
                {todayHours}
              </span>
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900 mb-3">メッセージ</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{cast.message}</p>
          <div className="grid grid-cols-2 gap-3 mt-8">
            <Link
              href={`/reserve/web?cast=${cast.id}`}
              className="col-span-2 md:col-span-1 bg-primary text-on-primary py-4 rounded-xl font-bold text-center"
            >
              WEB予約
            </Link>
            <Link
              href="/reserve"
              className="col-span-2 md:col-span-1 border-2 border-primary text-primary py-4 rounded-xl font-bold text-center"
            >
              チャットで予約
            </Link>
          </div>
        </div>

        {scheduleDates.length > 0 && (
          <div className="bg-white rounded-2xl border p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">今週の出勤</h2>
            <div className="space-y-3">
              {scheduleDates.map((d) => {
                const hours = getCastTodayHours(cast, d)
                return (
                  <div
                    key={d}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="font-medium">{formatJapaneseDate(d)}</span>
                    <span className="text-sm font-bold text-primary">{hours}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
