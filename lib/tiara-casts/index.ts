import { fetchCrmTiaraCastById, fetchCrmTiaraCasts } from './crm-casts'
import { getPlaceholderCastsForWeek } from './placeholder-casts'
import { mondayOf, weekDatesFromMonday } from './schedule-utils'
import type { TiaraCast } from './types'
import { businessToday } from '@/lib/business-date'

export type { TiaraCast, CastScheduleSlot, PlaceholderCastDef } from './types'
export {
  PLACEHOLDER_CASTS,
  isPlaceholdersEnabled,
  isPlaceholderWorkingOnDate,
} from './placeholder-casts'

/** 前後2週を含む5週分（週間表の前後ナビ用） */
function scheduleSpanDates(baseDateStr: string): string[] {
  const thisMonday = mondayOf(baseDateStr)
  const start = new Date(`${thisMonday}T12:00:00`)
  start.setDate(start.getDate() - 14)

  const dates: string[] = []
  for (let i = 0; i < 35; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

function mergeCastLists(real: TiaraCast[], placeholders: TiaraCast[]): TiaraCast[] {
  return [...real, ...placeholders]
}

/** CRM 本物 + ダミーをマージ（一覧・週間表用） */
export async function getAllTiaraCasts(): Promise<TiaraCast[]> {
  const today = businessToday()
  const spanDates = scheduleSpanDates(today)
  const [real, placeholders] = await Promise.all([
    fetchCrmTiaraCasts(),
    Promise.resolve(getPlaceholderCastsForWeek(spanDates)),
  ])
  return mergeCastLists(real, placeholders)
}

export { mondayOf, weekDatesFromMonday } from './schedule-utils'

/** 本日出勤カード用（その日スケジュールがあるキャストのみ） */
export async function getTodayTiaraCasts(): Promise<TiaraCast[]> {
  const today = businessToday()
  const all = await getAllTiaraCasts()
  return all.filter((c) => c.schedule[today] != null)
}

export async function getTiaraCastById(castId: string): Promise<TiaraCast | null> {
  if (castId.startsWith('dummy-')) {
    return null
  }
  return fetchCrmTiaraCastById(castId)
}

export function getCastTodayHours(cast: TiaraCast, dateStr = businessToday()): string | null {
  const slot = cast.schedule[dateStr]
  if (!slot) {
    return null
  }
  if (slot.end === 'LAST') {
    return `${slot.start}〜`
  }
  return `${slot.start}〜${slot.end}`
}

export function formatJapaneseDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return `${m}/${day}(${w})`
}
