'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { TiaraCast } from '@/lib/tiara-casts/types'
import { formatJapaneseDate, getCastTodayHours } from '@/lib/tiara-casts'
import { CastCard } from './CastCard'

type Props = {
  casts: TiaraCast[]
  today: string
}

function weekStartMonday(dateStr: string): Date {
  const d = new Date(`${dateStr}T12:00:00`)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function CastScheduleSection({ casts, today }: Props) {
  const [weekOffset, setWeekOffset] = useState(0)

  const weekDates = useMemo(() => {
    const start = weekStartMonday(today)
    start.setDate(start.getDate() + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d.toISOString().slice(0, 10)
    })
  }, [today, weekOffset])

  const todayCasts = casts.filter((c) => c.schedule[today] != null)

  const weekLabel = `${formatJapaneseDate(weekDates[0]).replace(/\(.*/, '')} 〜 ${formatJapaneseDate(weekDates[6]).replace(/\(.*/, '')}`

  return (
    <section id="schedule" className="pt-5 pb-12 px-4 bg-pink-50/40">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-xs text-gray-500 mb-1">
              西船橋メンズエステ　<span className="text-pink-600 font-bold tracking-widest">ティアラ</span>
            </h1>
            <h2 className="text-2xl font-bold text-gray-900">出勤スケジュール</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Schedule</p>
          </div>
          <Link href="/cast" className="text-pink-600 font-bold text-sm flex items-center shrink-0">
            一覧を見る
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>

        <div id="today-casts">
          <p className="text-xs font-bold text-pink-600 mb-3">本日 {formatJapaneseDate(today)}</p>
          {todayCasts.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center bg-white rounded-xl border">
              本日の出勤情報は準備中です
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {todayCasts.map((cast) => (
                <CastCard key={cast.id} cast={cast} today={today} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 pt-7 border-t border-gray-200">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900">今週の予定</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">Weekly</p>
              <p className="text-xs text-gray-500 mt-1.5">{weekLabel}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w - 1)}
                className="px-3 py-2 rounded-lg border bg-white text-sm font-bold hover:border-pink-400"
              >
                ← 前週
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="px-3 py-2 rounded-lg border bg-white text-sm font-bold hover:border-pink-400"
              >
                今週
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w + 1)}
                className="px-3 py-2 rounded-lg border bg-white text-sm font-bold hover:border-pink-400"
              >
                次週 →
              </button>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[640px] border-collapse bg-white rounded-2xl border shadow-sm overflow-hidden text-sm">
              <thead>
                <tr className="bg-pink-600 text-white">
                  <th className="text-left text-xs font-bold p-3 w-28 sticky left-0 bg-pink-600 z-10">
                    セラピスト
                  </th>
                  {weekDates.map((d) => (
                    <th key={d} className="text-center text-xs font-bold p-2 min-w-[4.5rem]">
                      {formatJapaneseDate(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {casts.map((cast) => (
                  <tr key={cast.id} className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white">
                      {cast.name}
                      {cast.isPlaceholder && (
                        <span className="ml-1 text-[10px] text-gray-400">※</span>
                      )}
                    </td>
                    {weekDates.map((d) => {
                      const slot = cast.schedule[d]
                      return (
                        <td key={d} className="p-2 text-center text-xs">
                          {slot ? (
                            <span className="font-bold text-pink-600">
                              {getCastTodayHours(cast, d)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">※ 印はサイト表示用ダミー（予約不可）</p>
        </div>
      </div>
    </section>
  )
}
