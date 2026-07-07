import type { CastScheduleSlot, PlaceholderCastDef, TiaraCast } from './types'
import {
  hashString,
  mondayOf,
  slotFromStartAndDuration,
  weekDatesFromMonday,
} from './schedule-utils'

/** サイト専用ダミー。CRM には登録しない。 */
export const PLACEHOLDER_CASTS: PlaceholderCastDef[] = [
  {
    id: 'dummy-hina',
    name: 'ひな',
    age: 25,
    height: 162,
    tags: ['明るい', '美肌'],
    image: '/cast/2.png',
    message: '「楽しい会話でリフレッシュ」',
  },
  {
    id: 'dummy-saki',
    name: 'さき',
    age: 22,
    height: 155,
    tags: ['清楚', 'マッサージ◎'],
    image: '/cast/3.png',
    message: '「心から安らげるひとときを」',
  },
  {
    id: 'dummy-miku',
    name: 'みく',
    age: 21,
    height: 160,
    tags: ['天然', '元CA'],
    image: '/cast/4.png',
    message: '「丁寧な癒しを心がけています」',
  },
]

/** 週あたりの出勤日数（3〜5日、キャスト・週ごとに固定） */
function pickWorkDaysForWeek(placeholderId: string, weekMonday: string): Set<string> {
  const days = weekDatesFromMonday(weekMonday)
  const h = hashString(`${weekMonday}:${placeholderId}:workcount`)
  const count = 3 + (h % 3)

  const sorted = [...days].sort(
    (a, b) =>
      hashString(`${weekMonday}:${placeholderId}:${a}`) -
      hashString(`${weekMonday}:${placeholderId}:${b}`)
  )

  return new Set(sorted.slice(0, count))
}

export function isPlaceholdersEnabled(): boolean {
  const raw = process.env.TIARA_PLACEHOLDER_CASTS
  if (raw === '0' || raw === 'false') {
    return false
  }
  return true
}

/** 週単位シードでその日「出勤」するか（週を変えると出勤日も変わる） */
export function isPlaceholderWorkingOnDate(placeholderId: string, dateStr: string): boolean {
  const weekMonday = mondayOf(dateStr)
  return pickWorkDaysForWeek(placeholderId, weekMonday).has(dateStr)
}

/** 平均8時間前後（7〜9時間）のランダムシフト */
export function placeholderScheduleForDate(
  placeholderId: string,
  dateStr: string
): CastScheduleSlot | null {
  if (!isPlaceholderWorkingOnDate(placeholderId, dateStr)) {
    return null
  }

  const weekMonday = mondayOf(dateStr)
  const h = hashString(`${weekMonday}:${placeholderId}:${dateStr}:slot`)

  // 12:00〜17:30 開始（30分刻み）
  const startMinutes = 12 * 60 + (h % 12) * 30
  // 7h / 7.5h / 8h / 8.5h / 9h（平均8h）
  const durationOptions = [420, 450, 480, 510, 540]
  const durationMinutes = durationOptions[(h >>> 0) % durationOptions.length]

  return slotFromStartAndDuration(startMinutes, durationMinutes)
}

export function buildPlaceholderCast(def: PlaceholderCastDef, weekDates: string[]): TiaraCast {
  const schedule: Record<string, CastScheduleSlot> = {}
  const mondays = new Set(weekDates.map((d) => mondayOf(d)))

  for (const weekMonday of mondays) {
    for (const dateStr of weekDatesFromMonday(weekMonday)) {
      const slot = placeholderScheduleForDate(def.id, dateStr)
      if (slot) {
        schedule[dateStr] = slot
      }
    }
  }

  return {
    id: def.id,
    name: def.name,
    age: def.age,
    height: def.height,
    image: def.image,
    tag: def.tags[0] ?? '',
    tags: def.tags,
    message: def.message,
    status: '在籍中',
    schedule,
    isPlaceholder: true,
  }
}

export function getPlaceholderCastsForWeek(weekDates: string[]): TiaraCast[] {
  if (!isPlaceholdersEnabled()) {
    return []
  }
  return PLACEHOLDER_CASTS.map((def) => buildPlaceholderCast(def, weekDates))
}
