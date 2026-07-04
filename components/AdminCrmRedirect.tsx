'use client'

import Link from 'next/link'

type Props = {
  brand: 'idol' | 'tiara' | 'mitsu'
}

const CRM_URL = 'https://crm.st-online.jp'

export function AdminCrmRedirect({ brand }: Props) {
  const label = brand === 'tiara'
    ? 'THE TIARA'
    : brand === 'idol'
      ? 'アイドル学園'
      : '人妻の蜜'

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center space-y-4">
        <p className="text-3xl">📋</p>
        <h1 className="text-xl font-bold">{label} 予約管理</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          予約の受付・確定・キャンセルは CRM 管理画面に統合されました。
          このサイトの Supabase 予約管理は使用しないでください。
        </p>
        <a
          href={CRM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 transition"
        >
          CRM ダッシュボードを開く
        </a>
        <Link href="/" className="inline-block text-xs text-slate-500 hover:text-slate-300">
          サイトトップへ
        </Link>
      </div>
    </main>
  )
}
