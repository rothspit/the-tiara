export type CastScheduleSlot = {
  start: string
  end: string
  /** 本日のみ CRM が返す即姫ステータス */
  waitStatus?: number
  attendEndTime?: string | null
}

export type TiaraCast = {
  id: string
  name: string
  age: number
  height: number | null
  image: string
  tag: string
  tags: string[]
  message: string
  status: string
  schedule: Record<string, CastScheduleSlot>
  /** サイト側ダミー（予約・プロフィール詳細なし） */
  isPlaceholder?: boolean
}

export type PlaceholderCastDef = {
  id: string
  name: string
  age: number
  height: number
  tags: string[]
  image: string
  message: string
}
