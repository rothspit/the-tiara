import type { CastScheduleSlot } from './types'

export function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** その週の月曜日 YYYY-MM-DD */
export function mondayOf(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

export function weekDatesFromMonday(weekMonday: string): string[] {
  const start = new Date(`${weekMonday}T12:00:00`)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function minutesToClock(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** 開始時刻 + 勤務時間（分）から表示用スロットを作る */
export function slotFromStartAndDuration(
  startMinutes: number,
  durationMinutes: number
): CastScheduleSlot {
  const endMinutes = startMinutes + durationMinutes
  const start = minutesToClock(startMinutes)

  if (endMinutes < 24 * 60) {
    return { start, end: minutesToClock(endMinutes) }
  }

  return { start, end: `翌${minutesToClock(endMinutes - 24 * 60)}` }
}
