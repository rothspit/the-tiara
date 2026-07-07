import type { CastScheduleSlot, TiaraCast } from './types'
import { businessToday } from '@/lib/business-date'

const CRM_URL = (process.env.CRM_API_URL || 'https://crm.st-online.jp').replace(/\/$/, '')
const STORE_CODE = 'the_tiara'
const STORE_ID = parseInt(process.env.CRM_TIARA_STORE_ID || '8', 10)

/** りな：ティアラ表示はデリヘル同様 16:00〜翌06:00 固定 */
const RINA_CAST_ID = parseInt(process.env.CRM_RINA_CAST_ID || '1522', 10)
const RINA_FIXED_SLOT: CastScheduleSlot = { start: '16:00', end: '翌06:00' }

type CrmPublicCast = {
  id: number
  name: string
  age: number | null
  height: number | null
  girl_comment?: string
  manager_comment?: string
  profile_media?: {
    thumbnail_url?: string | null
    profile_image_url?: string | null
  }
  public_profile?: {
    store_display_name?: string | null
    girl_comment?: string
    manager_comment?: string
    looks?: { height?: number | null }
  }
  status_label?: string
}

type WeekScheduleCast = {
  id: number
  name: string
  age: number | null
  photo_url?: string | null
  start_time?: string | null
  end_time?: string | null
  height?: number | null
  wait_status?: number
  attend_end_time?: string | null
}

type WeekScheduleResponse = {
  success?: boolean
  schedules?: Record<
    string,
    {
      casts?: WeekScheduleCast[]
    }
  >
}

function formatEndTime(end: string | null | undefined): string {
  if (!end) {
    return 'LAST'
  }
  if (end === '06:00' || end === '00:00') {
    return '翌06:00'
  }
  return end.length >= 5 ? end.slice(0, 5) : end
}

function buildScheduleFromWeek(
  castId: number,
  weekData: WeekScheduleResponse,
  todayStr?: string,
): Record<string, CastScheduleSlot> {
  const schedule: Record<string, CastScheduleSlot> = {}
  const days = weekData.schedules ?? {}
  const useRinaFixed = castId === RINA_CAST_ID

  for (const [dateStr, day] of Object.entries(days)) {
    const row = (day.casts ?? []).find((c) => c.id === castId)
    if (!row?.start_time) {
      continue
    }
    const slot: CastScheduleSlot = useRinaFixed
      ? RINA_FIXED_SLOT
      : {
          start: row.start_time.slice(0, 5),
          end: formatEndTime(row.end_time ?? null),
        }
    if (todayStr && dateStr === todayStr && row.wait_status != null) {
      slot.waitStatus = row.wait_status
      slot.attendEndTime = row.attend_end_time ?? null
    }
    schedule[dateStr] = slot
  }

  return schedule
}

function mapCrmCast(raw: CrmPublicCast, schedule: Record<string, CastScheduleSlot>): TiaraCast {
  const pub = raw.public_profile ?? {}
  const displayName = pub.store_display_name?.trim() || raw.name
  const message = (pub.girl_comment || raw.girl_comment || '').trim()
  const manager = (pub.manager_comment || raw.manager_comment || '').trim()
  const tagLine = manager.split('\n')[0]?.trim() || ''
  const image =
    raw.profile_media?.thumbnail_url ||
    raw.profile_media?.profile_image_url ||
    '/cast/1.png'
  const height = raw.height ?? pub.looks?.height ?? null

  return {
    id: String(raw.id),
    name: displayName,
    age: raw.age ?? 20,
    height: height !== null && height !== undefined ? Number(height) : null,
    image,
    tag: tagLine,
    tags: tagLine ? [tagLine.slice(0, 24)] : [],
    message: message || `「${displayName}」`,
    status: raw.status_label || '在籍中',
    schedule,
    isPlaceholder: false,
  }
}

export async function fetchCrmTiaraCasts(): Promise<TiaraCast[]> {
  const [castsRes, weekRes] = await Promise.all([
    fetch(`${CRM_URL}/api/public/casts?store_code=${STORE_CODE}&per_page=100`, {
      next: { revalidate: 60 },
    }),
    fetch(`${CRM_URL}/api/schedules/week?store_id=${STORE_ID}`, {
      next: { revalidate: 60 },
    }),
  ])

  if (!castsRes.ok) {
    console.error('[tiara-casts] CRM public casts failed', castsRes.status)
    return []
  }

  const castsJson = (await castsRes.json()) as { data?: CrmPublicCast[] }
  const weekData: WeekScheduleResponse = weekRes.ok
    ? ((await weekRes.json()) as WeekScheduleResponse)
    : { schedules: {} }

  const today = businessToday()

  return (castsJson.data ?? []).map((raw) =>
    mapCrmCast(raw, buildScheduleFromWeek(raw.id, weekData, today))
  )
}

export async function fetchCrmTiaraCastById(castId: string): Promise<TiaraCast | null> {
  const numericId = parseInt(castId, 10)
  if (!Number.isFinite(numericId)) {
    return null
  }

  const [castRes, weekRes] = await Promise.all([
    fetch(`${CRM_URL}/api/public/casts/${numericId}?store_code=${STORE_CODE}`, {
      next: { revalidate: 60 },
    }),
    fetch(`${CRM_URL}/api/schedules/week?store_id=${STORE_ID}`, {
      next: { revalidate: 60 },
    }),
  ])

  if (!castRes.ok) {
    return null
  }

  const castJson = (await castRes.json()) as { data?: CrmPublicCast }
  if (!castJson.data) {
    return null
  }

  const weekData: WeekScheduleResponse = weekRes.ok
    ? ((await weekRes.json()) as WeekScheduleResponse)
    : { schedules: {} }

  const today = businessToday()

  return mapCrmCast(castJson.data, buildScheduleFromWeek(numericId, weekData, today))
}
