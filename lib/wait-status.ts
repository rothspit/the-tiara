/** Tiara / CRM 共通 wait_status 表示 */
export function tiaraWaitStatusBadge(
  waitStatus: number | undefined | null,
  attendEndTime: string | null | undefined,
): { label: string; className: string } | null {
  if (waitStatus == null || waitStatus === 0) {
    return null
  }

  if (waitStatus === 1) {
    return {
      label: '即姫',
      className: 'bg-red-600 text-white animate-pulse font-black',
    }
  }

  if (waitStatus === 2) {
    const label =
      attendEndTime && !['即姫', '即ドル'].includes(attendEndTime)
        ? `接客中 · 次回${attendEndTime}`
        : '接客中'
    return {
      label,
      className: 'bg-slate-600 text-white font-bold',
    }
  }

  if (waitStatus === 3) {
    return {
      label: '受付終了',
      className: 'bg-gray-400 text-white font-bold',
    }
  }

  return null
}
