'use client'

import Link from 'next/link'

export default function TiaraAdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap');
        .font-cinzel { font-family: 'Cinzel Decorative', serif; }
      `}</style>

      {/* ヘッダー */}
      <header className="bg-black/50 backdrop-blur border-b border-amber-900/30">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="font-cinzel text-2xl text-amber-400 text-center">THE TIARA</h1>
          <p className="text-xs text-gray-500 text-center mt-1">Admin Dashboard</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* メニューカード */}
        <div className="grid gap-4">
          <Link
            href="/admin/bookings"
            className="block bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800 hover:border-amber-700/50 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-900/30 flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h2 className="font-cinzel text-lg text-amber-400">Reservations</h2>
                <p className="text-sm text-gray-400">予約管理</p>
              </div>
              <div className="ml-auto text-amber-500/50 text-2xl">→</div>
            </div>
          </Link>

          <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800/50 opacity-50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-800/50 flex items-center justify-center">
                <span className="text-2xl">👸</span>
              </div>
              <div>
                <h2 className="font-cinzel text-lg text-gray-500">Therapists</h2>
                <p className="text-sm text-gray-600">セラピスト管理（準備中）</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800/50 opacity-50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-800/50 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="font-cinzel text-lg text-gray-500">Analytics</h2>
                <p className="text-sm text-gray-600">売上分析（準備中）</p>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-600">THE TIARA Admin System</p>
        </div>
      </div>
    </main>
  )
}
