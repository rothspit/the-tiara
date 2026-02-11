'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from "@/lib/supabase"

interface Booking {
  id: string
  therapist_name: string
  course_minutes: number
  course_name?: string
  course_price?: number
  requested_time: string
  phone_number: string
  status: 'pending' | 'confirmed' | 'negotiating' | 'rejected' | 'cancelled'
  proposal_data?: {
    new_time?: string
    original_time?: string
    message?: string
  }
  notes?: string
  created_at: string
  updated_at: string
}

const statusLabels: Record<string, string> = {
  pending: '確認中',
  confirmed: '確定',
  negotiating: '調整中',
  rejected: 'お断り',
  cancelled: 'キャンセル',
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-900/50 text-amber-300 border-amber-600',
  confirmed: 'bg-emerald-900/50 text-emerald-300 border-emerald-600',
  negotiating: 'bg-blue-900/50 text-blue-300 border-blue-600',
  rejected: 'bg-red-900/50 text-red-300 border-red-600',
  cancelled: 'bg-gray-800/50 text-gray-400 border-gray-600',
}

export default function TiaraBookingDetailPage() {
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 時間調整モーダル
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [adjustMinutes, setAdjustMinutes] = useState(0)
  const [customMinutes, setCustomMinutes] = useState('')
  const [proposalMessage, setProposalMessage] = useState('')

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single()

        if (error) throw error
        setBooking(data)
      } catch (e) {
        setError('予約データの取得に失敗いたしました')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()

    const channel = supabase
      .channel(`tiara-booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          if (payload.new) {
            setBooking(payload.new as Booking)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId])

  const updateStatus = async (newStatus: string, proposalData?: any) => {
    if (!booking) return
    setUpdating(true)

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          proposal_data: proposalData,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      setBooking(result.booking)
      setShowTimeModal(false)
    } catch (e: any) {
      setError(e.message || '更新に失敗いたしました')
    } finally {
      setUpdating(false)
    }
  }

  const submitTimeAdjustment = () => {
    if (!booking) return

    const totalMinutes = adjustMinutes || parseInt(customMinutes) || 0
    if (totalMinutes === 0) {
      setError('調整時間をご選択ください')
      return
    }

    const [hours, mins] = booking.requested_time.split(':').map(Number)
    const totalMins = hours * 60 + mins + totalMinutes
    const newHours = Math.floor(totalMins / 60) % 24
    const newMins = totalMins % 60
    const newTime = `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`

    const message = proposalMessage || `${newTime}でございましたらご案内可能でございます。いかがでしょうか。`

    updateStatus('negotiating', {
      new_time: newTime,
      message: message,
      original_time: booking.requested_time,
      adjust_minutes: totalMinutes,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">予約が見つかりません</p>
          <Link href="/admin/bookings" className="text-amber-400 hover:underline">
            ← 予約一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap');
        .font-cinzel { font-family: 'Cinzel Decorative', serif; }
      `}</style>

      {/* ヘッダー */}
      <header className="bg-black/50 backdrop-blur border-b border-amber-900/30 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/bookings" className="text-amber-500/70 hover:text-amber-400 text-xl">
              ←
            </Link>
            <div>
              <h1 className="font-cinzel text-amber-400">Reservation Detail</h1>
              <p className="text-xs text-gray-500">ID: {booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${statusColors[booking.status]}`}>
            {statusLabels[booking.status]}
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-400">×</button>
          </div>
        )}

        {/* 予約情報カード */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <h2 className="font-cinzel text-amber-400 mb-4 flex items-center gap-2">
            <span>📋</span> Reservation Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-500 mb-1">ご指名セラピスト</p>
              <p className="font-bold text-lg text-amber-400">{booking.therapist_name}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-500 mb-1">ご希望時間</p>
              <p className="font-bold text-lg">{booking.requested_time}〜</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-500 mb-1">コース</p>
              <p className="font-bold">{booking.course_name || `${booking.course_minutes}分`}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-500 mb-1">料金</p>
              <p className="font-bold text-lg">¥{(booking.course_price || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 col-span-2">
              <p className="text-xs text-gray-500 mb-1">ご連絡先</p>
              <p className="font-bold text-lg">{booking.phone_number}</p>
              <a
                href={`tel:${booking.phone_number}`}
                className="inline-block mt-2 px-4 py-1 bg-amber-600 text-white text-sm rounded-full hover:bg-amber-500 transition"
              >
                📞 お電話
              </a>
            </div>
          </div>

          {/* 提案中の内容 */}
          {booking.status === 'negotiating' && booking.proposal_data && (
            <div className="mt-4 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="font-bold text-blue-300 mb-2">🕒 時間調整をご提案中</p>
              <p className="text-blue-200">
                <span className="line-through text-gray-500">{booking.proposal_data.original_time}</span>
                {' → '}
                <span className="font-bold">{booking.proposal_data.new_time}</span>
              </p>
              <p className="text-sm text-blue-300/70 mt-1">{booking.proposal_data.message}</p>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            <p>受付日時: {new Date(booking.created_at).toLocaleString('ja-JP')}</p>
          </div>
        </div>

        {/* 操作パネル */}
        {booking.status === 'pending' && (
          <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
            <h2 className="font-cinzel text-amber-400 mb-4">⚡ Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => updateStatus('confirmed')}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 border border-emerald-600"
              >
                <span className="text-xl">✅</span>
                <span>確定</span>
              </button>

              <button
                onClick={() => setShowTimeModal(true)}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-600 transition disabled:opacity-50 border border-blue-600"
              >
                <span className="text-xl">🕒</span>
                <span>時間調整</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('この予約をお断りいたしますか？')) {
                    updateStatus('rejected')
                  }
                }}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-red-700 text-white font-bold rounded-xl hover:bg-red-600 transition disabled:opacity-50 border border-red-600"
              >
                <span className="text-xl">❌</span>
                <span>お断り</span>
              </button>
            </div>
          </div>
        )}

        {booking.status === 'negotiating' && (
          <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
            <h2 className="font-cinzel text-amber-400 mb-4">⏳ お客様のご返答待ち</h2>
            <div className="flex gap-4">
              <button
                onClick={() => updateStatus('confirmed')}
                disabled={updating}
                className="px-6 py-3 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-600 border border-emerald-600"
              >
                ✅ 手動で確定
              </button>
              <button
                onClick={() => updateStatus('pending')}
                disabled={updating}
                className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 border border-gray-600"
              >
                ↩️ 確認中に戻す
              </button>
            </div>
          </div>
        )}

        {booking.status === 'confirmed' && (
          <div className="bg-emerald-900/30 border-2 border-emerald-600 rounded-xl p-6 text-center">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-cinzel text-emerald-300 text-xl">Confirmed</p>
            <p className="text-emerald-400/70 mt-2">お客様へのご連絡をお願いいたします</p>
          </div>
        )}
      </div>

      {/* 時間調整モーダル */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6">
            <h3 className="font-cinzel text-amber-400 text-lg mb-4">🕒 時間調整のご提案</h3>

            <p className="text-gray-400 mb-4">
              現在のご希望時間: <strong className="text-white">{booking.requested_time}</strong>
            </p>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">調整時間:</p>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setAdjustMinutes(mins)
                      setCustomMinutes('')
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition border ${
                      adjustMinutes === mins
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    +{mins}分
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">任意の分数:</p>
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => {
                  setCustomMinutes(e.target.value)
                  setAdjustMinutes(0)
                }}
                placeholder="例: 25"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">メッセージ（任意）:</p>
              <textarea
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="例: 19:30でございましたらご案内可能でございます。"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 h-20 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTimeModal(false)}
                className="flex-1 py-3 bg-gray-800 text-gray-300 font-bold rounded-xl hover:bg-gray-700 border border-gray-700"
              >
                キャンセル
              </button>
              <button
                onClick={submitTimeAdjustment}
                disabled={updating || (!adjustMinutes && !customMinutes)}
                className="flex-1 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 disabled:opacity-50 border border-amber-500"
              >
                {updating ? '送信中...' : 'ご提案を送信'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
