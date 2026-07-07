'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { TiaraCast } from '@/lib/tiara-casts/types'
import { formatJapaneseDate, getCastTodayHours } from '@/lib/tiara-casts'
import { addCalendarDays } from '@/lib/business-date'
import { CastCard } from './CastCard'

type Props = {
  casts: TiaraCast[]
  today: string
}

export function CastScheduleSection({ casts, today }: Props) {
  const [weekOffset, setWeekOffset] = useState(0)

  const weekDates = useMemo(() => {
    const startOffset = weekOffset * 7
    return Array.from({ length: 7 }, (_, i) => addCalendarDays(today, startOffset + i))
  }, [today, weekOffset])

  const todayCasts = casts.filter((c) => c.schedule[today] != null)

  const weekLabel = `${formatJapaneseDate(weekDates[0]).replace(/\(.*/, '')} 〜 ${formatJapaneseDate(weekDates[6]).replace(/\(.*/, '')}`

  return (
    <section id="schedule" className="pt-5 pb-section-padding px-margin-mobile bg-surface-variant">
      <div className="max-w-container-max mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-label-sm text-secondary font-medium mb-1">
              西船橋メンズエステ　<span className="text-primary font-bold tracking-[0.12em]">ティアラ</span>
            </h1>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">出勤スケジュール</h2>
            <p className="text-label-sm text-secondary uppercase tracking-widest">Schedule</p>
          </div>
          <Link href="/cast" className="text-primary font-bold flex items-center text-label-sm shrink-0">
            一覧を見る
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>

        <div id="today-casts">
          <p className="text-xs font-bold text-primary tracking-wide mb-3">本日 {formatJapaneseDate(today)}</p>
          {todayCasts.length === 0 ? (
            <p className="text-sm text-secondary py-8 text-center bg-white rounded-xl border border-outline-subtle">
              本日の出勤情報は準備中です
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-margin-mobile px-margin-mobile no-scrollbar">
              {todayCasts.map((cast) => (
                <CastCard key={cast.id} cast={cast} today={today} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 pt-7 border-t border-outline-subtle/70">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-on-surface text-base">今後7日間</h3>
              <p className="text-label-sm text-secondary uppercase tracking-widest mt-0.5">Weekly</p>
              <p className="text-xs text-secondary mt-1.5">{weekLabel}</p>
              <p className="text-[11px] text-primary/80 mt-1">※ 本日分は上のカードをご覧ください</p>
            </div>
            <div className="flex gap-2">
              {weekOffset > 0 && (
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className="px-3 py-2 rounded-lg border border-outline-subtle bg-white text-sm font-bold hover:border-primary transition-colors"
                >
                  本日から
                </button>
              )}
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w + 1)}
                className="px-3 py-2 rounded-lg border border-outline-subtle bg-white text-sm font-bold hover:border-primary transition-colors"
              >
                次の7日 →
              </button>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[640px] border-collapse bg-white rounded-2xl border border-outline-subtle shadow-sm overflow-hidden text-sm">
              <thead>
                <tr className="bg-primary text-on-primary">
                  <th className="text-left text-xs font-bold p-3 w-28 sticky left-0 bg-primary z-10">
                    セラピスト
                  </th>
                  {weekDates.map((d) => (
                    <th
                      key={d}
                      className={`text-center text-xs font-bold p-2 min-w-[4.5rem] ${d === today ? 'bg-primary-bright' : ''}`}
                    >
                      {formatJapaneseDate(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {casts.map((cast) => (
                  <tr key={cast.id} className="border-t border-outline-subtle/70">
                    <td className="p-3 font-medium text-on-surface sticky left-0 bg-white">
                      {cast.name}
                    </td>
                    {weekDates.map((d) => {
                      const slot = cast.schedule[d]
                      return (
                        <td
                          key={d}
                          className={`p-2 text-center text-xs ${d === today ? 'bg-primary-container/40' : ''}`}
                        >
                          {slot ? (
                            <span className="font-bold text-primary">
                              {getCastTodayHours(cast, d)}
                            </span>
                          ) : (
                            <span className="text-secondary">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
