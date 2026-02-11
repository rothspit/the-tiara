'use client'

import { useState, useEffect } from 'react'
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
  status: string
  created_at: string
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

export default function TiaraBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchBookings = async () => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (!error && data) {
        setBookings(data)
      }
      setLoading(false)
    }

    fetchBookings()

    // リアルタイム監視
    const channel = supabase
      .channel('tiara-bookings-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchBookings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  const pendingCount = bookings.filter(b => b.status === 'pending').length

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
            <Link href="/admin" className="text-amber-500/70 hover:text-amber-400 text-xl">
              ←
            </Link>
            <div>
              <h1 className="font-cinzel text-amber-400 text-lg">THE TIARA</h1>
              <p className="text-xs text-gray-500">Reservation Management</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="bg-amber-500/20 border border-amber-500/50 px-3 py-1 rounded-full">
              <span className="text-amber-400 text-sm font-bold">
                🔔 {pendingCount}件の新規予約
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* フィルター */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'すべて' },
            { value: 'pending', label: '🟡 確認中' },
            { value: 'negotiating', label: '🔵 調整中' },
            { value: 'confirmed', label: '🟢 確定' },
            { value: 'rejected', label: 'お断り' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                filter === f.value
                  ? 'bg-amber-500/30 text-amber-300 border-amber-500'
                  : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* リスト */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-500 border-t-transparent"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">📭</p>
            <p className="font-cinzel">No Reservations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="block bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-800 hover:border-amber-700/50 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusColors[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </span>
                    <span className="font-bold text-amber-400">{booking.therapist_name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(booking.created_at).toLocaleString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>🕐 {booking.requested_time}〜</span>
                  <span>💎 {booking.course_name || `${booking.course_minutes}分`}</span>
                  <span>📞 {booking.phone_number}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
