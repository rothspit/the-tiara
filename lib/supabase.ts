import { createClient, SupabaseClient } from '@supabase/supabase-js'

// =============================================
// THE TIARA専用 Supabase設定
// =============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkkfmwlrdyhzhbjnoerw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtra2Ztd2xyZHloemhiam5vZXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMDMyODUsImV4cCI6MjA1NDg3OTI4NX0.Lmgg1cNB8mRCuqGf8S3jyOxX17WY9dZYPIeKjP5slFA'

// シングルトンインスタンス
let supabaseInstance: SupabaseClient | null = null

// クライアント取得（ブラウザ・サーバー共用）
export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }
  return supabaseInstance
}

// 直接エクスポート
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 予約データの型定義
export interface Booking {
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
    proposed_at?: string
    adjust_minutes?: number
  }
  notes?: string
  created_at: string
  updated_at: string
}

// ステータスの日本語ラベル
export const statusLabels: Record<Booking['status'], string> = {
  pending: '確認中',
  confirmed: '確定',
  negotiating: '調整中',
  rejected: 'お断り',
  cancelled: 'キャンセル',
}

// ステータスの色（ダークテーマ用）
export const statusColors: Record<Booking['status'], string> = {
  pending: 'bg-amber-900/50 text-amber-300 border-amber-600',
  confirmed: 'bg-emerald-900/50 text-emerald-300 border-emerald-600',
  negotiating: 'bg-blue-900/50 text-blue-300 border-blue-600',
  rejected: 'bg-red-900/50 text-red-300 border-red-600',
  cancelled: 'bg-gray-800/50 text-gray-400 border-gray-600',
}
