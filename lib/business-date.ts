/** CRM BusinessDate（JST 8:00 切替）と同じ営業日 YYYY-MM-DD */
const ROLLOVER_HOUR = 8
const JST = 'Asia/Tokyo'

function jstCalendarParts(date = new Date()): { y: number; m: number; d: number; hour: number } {
  const jst = new Date(date.toLocaleString('en-US', { timeZone: JST }))
  return {
    y: jst.getFullYear(),
    m: jst.getMonth() + 1,
    d: jst.getDate(),
    hour: jst.getHours(),
  }
}

function formatYmd(y: number, m: number, d: number): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${y}-${pad(m)}-${pad(d)}`
}

export function businessToday(from = new Date()): string {
  const { y, m, d, hour } = jstCalendarParts(from)
  if (hour < ROLLOVER_HOUR) {
    const prev = new Date(`${formatYmd(y, m, d)}T12:00:00+09:00`)
    prev.setDate(prev.getDate() - 1)
    return formatYmd(prev.getFullYear(), prev.getMonth() + 1, prev.getDate())
  }
  return formatYmd(y, m, d)
}

/** 営業日文字列に日数を加算（タイムゾーンずれ防止で JST 正午基準） */
export function addCalendarDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00+09:00`)
  d.setDate(d.getDate() + days)
  return formatYmd(d.getFullYear(), d.getMonth() + 1, d.getDate())
}
