'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

// チャットメッセージの型定義
type MessageType = 'bot' | 'user' | 'card' | 'menu' | 'course' | 'time' | 'phone' | 'confirm' | 'submit' | 'complete' | 'waiting' | 'proposal'
interface ChatMessage {
  id: number
  type: MessageType
  content: string
  data?: any
}

// 電話番号入力コンポーネント
function PhoneInput({ onSubmit }: { onSubmit: (phone: string) => void }) {
  const [phone, setPhone] = useState('')

  const handleSubmit = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length >= 10) {
      onSubmit(cleanPhone)
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <p className="text-xs text-gray-500 mb-2">ご連絡先電話番号</p>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="09012345678"
        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg text-center tracking-wider focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        autoFocus
      />
      <button
        onClick={handleSubmit}
        disabled={phone.replace(/[^0-9]/g, '').length < 10}
        className="w-full mt-3 py-3 rounded-xl font-bold text-sm transition active:scale-95 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #D4AF37, #F4E4BA, #D4AF37)', color: '#1A1A1A' }}
      >
        次へ進む
      </button>
      <p className="text-[10px] text-gray-400 mt-2 text-center">
        ご予約確認のご連絡に使用いたします
      </p>
    </div>
  )
}

export default function TiaraPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [splashFadeOut, setSplashFadeOut] = useState(false)

  // チャットボット状態
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedCast, setSelectedCast] = useState<any>(null)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // スプラッシュスクリーン制御
  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFadeOut(true), 1500)
    const hideTimer = setTimeout(() => setShowSplash(false), 2200)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  // チャット自動スクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 予約ステータスのリアルタイム監視
  useEffect(() => {
    if (!currentBookingId) return

    const channel = supabase
      .channel(`tiara-booking-${currentBookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${currentBookingId}`,
        },
        (payload) => {
          const newStatus = (payload.new as any).status
          const proposalData = (payload.new as any).proposal_data

          if (newStatus === 'confirmed') {
            addMessage('bot', '✨ ご予約が確定いたしました ✨\n\nお時間になりましたらお越しくださいませ。\nスタッフ一同、心よりお待ち申し上げております。')
          } else if (newStatus === 'negotiating' && proposalData) {
            addMessage('proposal', '', {
              original_time: proposalData.original_time,
              new_time: proposalData.new_time,
              message: proposalData.message,
            })
          } else if (newStatus === 'rejected') {
            addMessage('bot', '誠に申し訳ございませんが、ご希望のお時間でのご案内が難しい状況でございます。\n\n別のお時間をご検討いただけますと幸いでございます。')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentBookingId])

  // チャット初期化
  const initChat = () => {
    setChatOpen(true)
    setMessages([])
    setSelectedCast(null)
    setSelectedCourse(null)
    setSelectedTime('')
    setPhoneNumber('')
    setCurrentBookingId(null)
    setIsSubmitting(false)

    setTimeout(() => {
      addMessage('bot', 'ようこそ、THE TIARAへ。\nご希望をお聞かせください。')
      setTimeout(() => addMessage('menu', ''), 500)
    }, 300)
  }

  // メッセージ追加
  const addMessage = (type: MessageType, content: string, data?: any) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), type, content, data }])
  }

  // ダミーキャストデータ
  const availableCasts = [
    { id: 1, name: 'りな', age: 22, status: '即ご案内OK', tag: '癒し系', available: true },
    { id: 2, name: 'さき', age: 23, status: '14:00〜', tag: '元CA', available: true },
    { id: 3, name: 'みく', age: 21, status: '即ご案内OK', tag: '天然', available: true },
  ]

  const courses = [
    { name: 'スタンダード', time: '70分', price: 18000 },
    { name: 'ロイヤル', time: '100分', price: 26000, popular: true },
    { name: 'ティアラVIP', time: '150分', price: 50000 },
  ]

  const timeSlots = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

  // メニュー選択ハンドラー
  const handleMenuSelect = (choice: string) => {
    if (choice === 'availability') {
      addMessage('user', '出勤状況を見たい')
      setTimeout(() => {
        addMessage('bot', '本日ご案内可能なキャストをご紹介いたします。')
        setTimeout(() => addMessage('card', '', { casts: availableCasts }), 600)
      }, 500)
    } else if (choice === 'search') {
      addMessage('user', 'キャストを探したい')
      setTimeout(() => {
        addMessage('bot', 'ご希望のタイプはございますか？\n本日の出勤キャストをご覧ください。')
        setTimeout(() => addMessage('card', '', { casts: availableCasts }), 600)
      }, 500)
    }
  }

  // キャスト選択
  const handleCastSelect = (cast: any) => {
    setSelectedCast(cast)
    addMessage('user', `${cast.name}さんを指名したい`)
    setTimeout(() => {
      addMessage('bot', `${cast.name}をお選びいただきありがとうございます。\nコースをお選びください。`)
      setTimeout(() => addMessage('course', '', { courses }), 500)
    }, 500)
  }

  // コース選択
  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course)
    addMessage('user', `${course.name}コース（${course.time}）`)
    setTimeout(() => {
      addMessage('bot', 'ご希望のお時間をお選びください。')
      setTimeout(() => addMessage('time', '', { times: timeSlots }), 500)
    }, 500)
  }

  // 時間選択
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    addMessage('user', `${time}〜 希望`)
    setTimeout(() => {
      addMessage('bot', 'ありがとうございます。\n\nご連絡先のお電話番号をご入力ください。')
      setTimeout(() => addMessage('phone', ''), 500)
    }, 500)
  }

  // 電話番号送信
  const handlePhoneSubmit = (phone: string) => {
    if (!phone || phone.length < 10) {
      addMessage('bot', '恐れ入りますが、正しい電話番号をご入力ください。')
      return
    }
    setPhoneNumber(phone)
    addMessage('user', phone)
    setTimeout(() => {
      addMessage('bot', `ありがとうございます。\n\n📍 場所: 秋葉原プライベートルーム\n（詳細はご予約確定後にご案内いたします）`)
      setTimeout(() => addMessage('confirm', '', { cast: selectedCast, course: selectedCourse, time: selectedTime, phone }), 800)
    }, 500)
  }

  // 予約確定
  const handleConfirm = async (usePoints: boolean) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    addMessage('user', usePoints ? '会員登録して2,000ptを使う' : 'ゲストとして予約')
    addMessage('submit', '', { submitting: true })

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapist: {
            id: selectedCast.id,
            name: selectedCast.name,
          },
          course: {
            name: selectedCourse.name,
            time: selectedCourse.time,
            price: selectedCourse.price,
          },
          startTime: selectedTime,
          phone: phoneNumber,
          usePoints,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '予約処理中にエラーが発生いたしました')
      }

      setCurrentBookingId(result.bookingId)

      // 送信中メッセージを削除
      setMessages(prev => prev.filter(m => m.type !== 'submit'))

      const price = selectedCourse.price - (usePoints ? 2000 : 0)
      addMessage('bot', `✨ ご予約リクエストを承りました ✨\n\n👸 ${selectedCast.name}\n📋 ${selectedCourse.name}（${selectedCourse.time}）\n🕐 ${selectedTime}〜\n💰 ¥${price.toLocaleString()}\n📞 ${phoneNumber}`)
      setTimeout(() => {
        addMessage('waiting', '', { bookingId: result.bookingId })
      }, 800)
    } catch (error: any) {
      setMessages(prev => prev.filter(m => m.type !== 'submit'))
      addMessage('bot', `申し訳ございません。${error.message}\n\n恐れ入りますが、もう一度お試しください。`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 時間調整の提案に応答
  const handleProposalResponse = async (accept: boolean, newTime?: string) => {
    if (!currentBookingId) return

    if (accept && newTime) {
      addMessage('user', `${newTime}で承知いたしました`)
      try {
        await fetch(`/api/bookings/${currentBookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'confirmed' }),
        })
      } catch (e) {
        addMessage('bot', '恐れ入りますが、通信エラーが発生いたしました。')
      }
    } else {
      addMessage('user', '別のお時間を希望します')
      addMessage('bot', '承知いたしました。別のご希望時間をお選びください。')
      setTimeout(() => addMessage('time', '', { times: timeSlots }), 500)
    }
  }

  // ダミーデータ
  const todaysPrincess = [
    { id: 1, name: 'りな', age: 22, status: '即ご案内', time: null },
    { id: 2, name: 'さき', age: 23, status: '待機中', time: '14:00〜' },
    { id: 3, name: 'みく', age: 21, status: '待機中', time: '15:30〜' },
    { id: 4, name: 'ゆき', age: 24, status: '接客中', time: '17:00〜' },
    { id: 5, name: 'あおい', age: 22, status: '待機中', time: '16:00〜' },
  ]

  const ranking = [
    { rank: 1, name: 'りな', age: 22, color: '#FFD700' },
    { rank: 2, name: 'さき', age: 23, color: '#C0C0C0' },
    { rank: 3, name: 'みく', age: 21, color: '#CD7F32' },
  ]

  const allCast = [
    { id: 1, name: 'りな', age: 22, tag: '癒し系' },
    { id: 2, name: 'さき', age: 23, tag: '元CA' },
    { id: 3, name: 'みく', age: 21, tag: '天然' },
    { id: 4, name: 'ゆき', age: 24, tag: 'モデル' },
    { id: 5, name: 'あおい', age: 22, tag: '清楚' },
    { id: 6, name: 'かれん', age: 23, tag: 'ハーフ' },
    { id: 7, name: 'ひな', age: 21, tag: 'ロリ系' },
    { id: 8, name: 'れな', age: 24, tag: '技術派' },
  ]

  const accordionItems = [
    { title: '利用規約', content: '当店は18歳以上の方を対象としたメンズエステサロンです。ご利用の際は身分証明書のご提示をお願いしております。' },
    { title: 'キャンセルポリシー', content: '予約時間の2時間前までは無料でキャンセル可能です。それ以降のキャンセルはキャンセル料が発生する場合がございます。' },
    { title: 'プライバシーポリシー', content: 'お客様の個人情報は厳重に管理し、第三者への提供は一切行いません。' },
  ]

  return (
    <>
      {/* Splash Screen */}
      {showSplash && (
        <div className={`fixed inset-0 z-[100] bg-white flex items-center justify-center transition-opacity duration-700 ${splashFadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`transition-all duration-1000 ${splashFadeOut ? 'opacity-0 scale-95' : 'animate-splash-logo'}`}>
            <img src="/tiara-logo.png" alt="THE TIARA" className="w-48 md:w-64 h-auto" />
          </div>
        </div>
      )}

      <main className="min-h-screen bg-[#F8F9FA] text-[#333333] pb-20">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
          body { font-family: 'Noto Sans JP', sans-serif; }

          @keyframes splashLogo {
            0% { opacity: 0; transform: scale(0.8) translateY(20px); }
            50%, 100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-splash-logo { animation: splashLogo 1s ease-out forwards; }

          .news-ticker { animation: ticker 20s linear infinite; }
          @keyframes ticker {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }

          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          @keyframes fabShine {
            0%, 100% { box-shadow: 0 4px 15px rgba(180, 160, 120, 0.3); }
            50% { box-shadow: 0 4px 25px rgba(180, 160, 120, 0.6); }
          }
          .fab-shine { animation: fabShine 2s ease-in-out infinite; }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .card-shimmer {
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
            background-size: 200% 100%;
            animation: shimmer 3s infinite;
          }
        `}</style>

        {/* Header */}
        <header className="bg-white sticky top-0 z-50 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 flex flex-col justify-center items-center gap-1.5">
              <span className={`w-5 h-0.5 bg-[#333] transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-[#333] transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-[#333] transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
            <div className="absolute left-1/2 -translate-x-1/2">
              <img src="/tiara-logo.png" alt="THE TIARA" className="h-10 md:h-12 w-auto" />
            </div>
            <div className="w-8"></div>
          </div>
          {menuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100">
              {['ホーム', 'キャスト', '料金システム', 'アクセス', '求人情報'].map((item, i) => (
                <a key={i} href="#" className="block px-6 py-4 border-b border-gray-50 hover:bg-gray-50 text-sm">{item}</a>
              ))}
            </div>
          )}
        </header>

        {/* News Ticker */}
        <div className="bg-[#E5E7EB] overflow-hidden py-2">
          <div className="news-ticker whitespace-nowrap text-sm text-[#333]">
            🎀 新人「ひなちゃん」本日デビュー！ 　｜　 ✨ 期間限定！初回指名料無料キャンペーン中 　｜　 👑 人気No.1「りなちゃん」出勤中！
          </div>
        </div>

        {/* Today's Princess */}
        <section className="py-6">
          <div className="px-4 mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="text-xl">👑</span> Today's Princess
            </h2>
            <a href="#" className="text-xs text-pink-500 font-medium">すべて見る →</a>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2">
            {todaysPrincess.map((cast) => (
              <div key={cast.id} className="flex-shrink-0 w-36">
                <div className="aspect-[3/4] bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl overflow-hidden relative shadow-md">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                      <span className="text-3xl">👸</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    {cast.status === '即ご案内' ? (
                      <span className="inline-block bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">即ご案内</span>
                    ) : cast.status === '接客中' ? (
                      <span className="inline-block bg-gray-400 text-white text-[10px] font-bold px-2 py-1 rounded-full">{cast.time}〜</span>
                    ) : (
                      <span className="inline-block bg-white/90 text-[#333] text-[10px] font-bold px-2 py-1 rounded-full shadow">{cast.time}</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className="font-bold text-sm">{cast.name}</p>
                  <p className="text-[10px] text-gray-400">{cast.age}歳</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ranking */}
        <section className="py-6 px-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">🏆</span> Weekly Ranking
          </h2>
          <div className="flex gap-3 justify-center">
            {ranking.map((cast) => (
              <div key={cast.rank} className="flex-1 max-w-[120px]">
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                    {cast.rank === 1 ? '👑' : cast.rank === 2 ? '🥈' : '🥉'}
                  </div>
                  <div className="aspect-square bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-md" style={{ border: `3px solid ${cast.color}` }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">👸</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className="font-bold text-sm">{cast.name}</p>
                  <p className="text-[10px] text-gray-400">{cast.age}歳</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* X Banner */}
        <section className="px-4 py-4">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="block bg-black text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">𝕏</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">リアルタイム空き状況</p>
                <p className="text-[11px] text-gray-300">最新の出勤情報をチェック →</p>
              </div>
              <div className="text-2xl">→</div>
            </div>
          </a>
        </section>

        {/* Jewel Box */}
        <section className="py-6 px-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">💎</span> Jewel Box
            <span className="text-xs font-normal text-gray-400 ml-2">在籍キャスト</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {allCast.map((cast) => (
              <div key={cast.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-[3/4] bg-gradient-to-b from-gray-50 to-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl opacity-30">👸</span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="bg-white/90 text-[10px] font-medium px-2 py-1 rounded-full shadow-sm">#{cast.tag}</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm">{cast.name}</p>
                  <p className="text-[10px] text-gray-400">{cast.age}歳</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <a href="#" className="inline-block border border-[#E5E7EB] text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-50 transition">もっと見る</a>
          </div>
        </section>

        {/* ========== Member's Privilege (会員特典) ========== */}
        <section className="py-8 px-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">💳</span> Member's Privilege
            <span className="text-xs font-normal text-gray-400 ml-2">会員特典</span>
          </h2>

          {/* Luxury Member Card */}
          <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl" style={{
            background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 50%, #0D0D0D 100%)',
          }}>
            {/* Shimmer Effect */}
            <div className="absolute inset-0 card-shimmer opacity-20"></div>

            {/* Card Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4E4BA 50%, #D4AF37 100%)' }}>
                    <span className="text-sm">👑</span>
                  </div>
                  <span className="text-white/90 text-xs tracking-widest font-medium">THE TIARA MEMBER</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/50">PLATINUM</span>
                </div>
              </div>

              {/* Main Benefit */}
              <div className="text-center py-4">
                <p className="text-white/60 text-xs mb-2">会員登録で今すぐもらえる</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold" style={{ background: 'linear-gradient(135deg, #D4AF37, #F4E4BA, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    2,000
                  </span>
                  <span className="text-lg" style={{ background: 'linear-gradient(135deg, #D4AF37, #F4E4BA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>pt</span>
                </div>
                <p className="text-white/40 text-[10px] mt-1">（2,000円相当）</p>
              </div>

              {/* Benefits List */}
              <div className="mt-4 space-y-2">
                {[
                  '初回ご来店時にすぐ使える',
                  'ポイントは1pt = 1円として利用可能',
                  '誕生月は2倍ポイント進呈',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/70 text-xs">
                    <span style={{ color: '#D4AF37' }}>✓</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={initChat}
                className="w-full mt-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4E4BA 50%, #D4AF37 100%)', color: '#1A1A1A' }}
              >
                今すぐ会員登録して予約する
              </button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-24 h-24 opacity-10" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 opacity-10" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}></div>
          </div>
        </section>

        {/* System (料金) */}
        <section className="py-6 px-4 bg-white">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">💰</span> System
          </h2>
          <div className="space-y-3">
            {courses.map((plan, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${plan.popular ? 'border-pink-300 bg-pink-50' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  {plan.popular && <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">人気</span>}
                  <div>
                    <p className="font-bold text-sm">{plan.name}</p>
                    <p className="text-[10px] text-gray-400">{plan.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">¥{plan.price.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 ml-1">（税込）</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-4 text-center">※ 指名料・本指名料は別途頂戴いたします</p>
        </section>

        {/* Footer Info */}
        <section className="py-6 px-4">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <span>📍</span> アクセス
            </h3>
            <p className="text-sm text-gray-600 mb-2">JR秋葉原駅 電気街口より徒歩3分</p>
            <p className="text-[10px] text-gray-400">※詳細な住所はご予約時にお伝えします</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm"><span className="text-gray-400">営業時間:</span> 12:00 - 05:00</p>
              <p className="text-sm"><span className="text-gray-400">定休日:</span> 年中無休</p>
            </div>
          </div>
          <div className="space-y-2">
            {accordionItems.map((item, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <button onClick={() => setActiveAccordion(activeAccordion === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="font-medium text-sm">{item.title}</span>
                  <span className={`transition-transform ${activeAccordion === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {activeAccordion === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400">© 2024 THE TIARA All Rights Reserved.</p>
          </div>
        </section>

        {/* FAB Button */}
        <button
          onClick={initChat}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 transition active:scale-95 fab-shine"
          style={{ background: 'linear-gradient(135deg, #4A4A4A 0%, #2D2D2D 50%, #1A1A1A 100%)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M2 17L5 8L9 12L12 4L15 12L19 8L22 17H2Z" fill="url(#crownGradient)" stroke="#B4A078" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M3 20H21" stroke="#B4A078" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="6" r="1" fill="#D4C4A0" />
            <circle cx="5" cy="10" r="0.8" fill="#D4C4A0" />
            <circle cx="19" cy="10" r="0.8" fill="#D4C4A0" />
            <defs>
              <linearGradient id="crownGradient" x1="2" y1="4" x2="22" y2="20">
                <stop offset="0%" stopColor="#D4C4A0" />
                <stop offset="50%" stopColor="#B4A078" />
                <stop offset="100%" stopColor="#8B7355" />
              </linearGradient>
            </defs>
          </svg>
        </button>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
          <div className="flex justify-around py-2">
            {[
              { icon: '🔍', label: '探す', active: true },
              { icon: '🏆', label: 'ランキング' },
              { icon: '💬', label: 'トーク' },
              { icon: '📅', label: '予約' },
              { icon: '👤', label: 'マイページ' },
            ].map((item, i) => (
              <a key={i} href="#" className={`flex flex-col items-center gap-0.5 px-3 py-1 ${item.active ? 'text-pink-500' : 'text-gray-400'}`}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </a>
            ))}
          </div>
          <div className="h-[env(safe-area-inset-bottom)]"></div>
        </nav>
      </main>

      {/* ========== Chat Modal ========== */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 flex items-end justify-center"
            onClick={() => setChatOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md h-[85vh] bg-[#F0F0F0] rounded-t-3xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Chat Header */}
              <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-lg">👑</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">THE TIARA Concierge</p>
                    <p className="text-[10px] text-green-500">● オンライン</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    >
                      {/* Bot Message */}
                      {msg.type === 'bot' && (
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">👑</span>
                          </div>
                          <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%] shadow-sm">
                            <p className="text-sm whitespace-pre-line">{msg.content}</p>
                          </div>
                        </div>
                      )}

                      {/* User Message */}
                      {msg.type === 'user' && (
                        <div className="flex justify-end">
                          <div className="bg-pink-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%]">
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      )}

                      {/* Menu Options */}
                      {msg.type === 'menu' && (
                        <div className="flex gap-2 pl-10">
                          <button onClick={() => handleMenuSelect('availability')} className="bg-white border border-pink-200 text-pink-500 rounded-full px-4 py-2 text-sm font-medium shadow-sm hover:bg-pink-50 transition">
                            📅 出勤状況
                          </button>
                          <button onClick={() => handleMenuSelect('search')} className="bg-white border border-pink-200 text-pink-500 rounded-full px-4 py-2 text-sm font-medium shadow-sm hover:bg-pink-50 transition">
                            🔍 キャスト検索
                          </button>
                        </div>
                      )}

                      {/* Cast Cards */}
                      {msg.type === 'card' && msg.data?.casts && (
                        <div className="pl-10 space-y-3">
                          {msg.data.casts.map((cast: any, idx: number) => (
                            <motion.div
                              key={cast.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.15 }}
                              className="bg-white rounded-xl overflow-hidden shadow-md"
                            >
                              <div className="flex">
                                <div className="w-24 h-32 bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
                                  <span className="text-4xl">👸</span>
                                </div>
                                <div className="flex-1 p-3 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold">{cast.name}</span>
                                      <span className="text-[10px] text-gray-400">{cast.age}歳</span>
                                    </div>
                                    <span className="inline-block bg-gray-100 text-[10px] px-2 py-0.5 rounded-full">#{cast.tag}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    {cast.available && (
                                      <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                        {cast.status}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleCastSelect(cast)}
                                      className="bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-pink-400 transition"
                                    >
                                      指名する
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Course Selection */}
                      {msg.type === 'course' && msg.data?.courses && (
                        <div className="pl-10 space-y-2">
                          {msg.data.courses.map((course: any) => (
                            <button
                              key={course.name}
                              onClick={() => handleCourseSelect(course)}
                              className={`w-full bg-white rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition text-left ${course.popular ? 'border-2 border-pink-300' : ''}`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  {course.popular && <span className="bg-pink-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">人気</span>}
                                  <span className="font-bold text-sm">{course.name}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">{course.time}</span>
                              </div>
                              <span className="font-bold">¥{course.price.toLocaleString()}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Time Selection */}
                      {msg.type === 'time' && msg.data?.times && (
                        <div className="pl-10 flex flex-wrap gap-2">
                          {msg.data.times.map((time: string) => (
                            <button
                              key={time}
                              onClick={() => handleTimeSelect(time)}
                              className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium hover:bg-pink-50 hover:border-pink-300 transition"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Phone Input */}
                      {msg.type === 'phone' && (
                        <div className="pl-10">
                          <PhoneInput onSubmit={handlePhoneSubmit} />
                        </div>
                      )}

                      {/* Confirmation */}
                      {msg.type === 'confirm' && msg.data && (
                        <div className="pl-10">
                          <div className="bg-white rounded-xl p-4 shadow-md">
                            <p className="font-bold text-sm mb-3 text-center">ご予約内容の確認</p>
                            <div className="space-y-2 text-sm border-b border-gray-100 pb-3 mb-3">
                              <div className="flex justify-between">
                                <span className="text-gray-500">セラピスト</span>
                                <span className="font-medium">{msg.data.cast.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">コース</span>
                                <span className="font-medium">{msg.data.course.name}（{msg.data.course.time}）</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">時間</span>
                                <span className="font-medium">{msg.data.time}〜</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">場所</span>
                                <span className="font-medium">秋葉原ルーム</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">電話番号</span>
                                <span className="font-medium">{msg.data.phone}</span>
                              </div>
                            </div>

                            {/* Point Usage Option */}
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 mb-3 border border-amber-200">
                              <p className="text-xs font-bold text-amber-700 mb-1">🎁 会員登録特典</p>
                              <p className="text-[10px] text-amber-600">今なら2,000ptをすぐに使えます！</p>
                            </div>

                            <div className="space-y-2">
                              <button
                                onClick={() => handleConfirm(true)}
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl font-bold text-sm transition active:scale-95 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F4E4BA, #D4AF37)', color: '#1A1A1A' }}
                              >
                                会員登録して2,000ptを使う
                              </button>
                              <button
                                onClick={() => handleConfirm(false)}
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
                              >
                                ゲストとして予約（ポイントなし）
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Submitting */}
                      {msg.type === 'submit' && (
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">👑</span>
                          </div>
                          <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"></div>
                              <span className="text-sm text-gray-600">ご予約を処理中でございます...</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Waiting for Store Confirmation */}
                      {msg.type === 'waiting' && (
                        <div className="pl-10">
                          <div className="bg-gradient-to-r from-amber-900/90 to-gray-900 rounded-xl p-4 shadow-lg border border-amber-700/30">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37, #F4E4BA)' }}>
                                <span className="animate-pulse">⏳</span>
                              </div>
                              <div>
                                <p className="font-bold text-amber-300 text-sm">店舗確認中</p>
                                <p className="text-[10px] text-amber-400/70">ステータスはリアルタイムで更新されます</p>
                              </div>
                            </div>
                            <p className="text-xs text-amber-200/80 leading-relaxed">
                              ご予約リクエストを受け付けました。<br/>
                              店舗スタッフが確認次第、ステータスが更新されます。<br/>
                              そのままお待ちくださいませ。
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Time Proposal */}
                      {msg.type === 'proposal' && msg.data && (
                        <div className="pl-10">
                          <div className="bg-gradient-to-r from-blue-900/90 to-gray-900 rounded-xl p-4 shadow-lg border border-blue-700/30">
                            <p className="font-bold text-blue-300 text-sm mb-2">🕒 時間調整のご提案</p>
                            <p className="text-blue-200 text-sm mb-3">
                              <span className="line-through text-gray-500">{msg.data.original_time}</span>
                              {' → '}
                              <span className="font-bold text-amber-300">{msg.data.new_time}</span>
                            </p>
                            {msg.data.message && (
                              <p className="text-xs text-blue-300/80 mb-4 border-l-2 border-blue-500 pl-2">
                                {msg.data.message}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleProposalResponse(true, msg.data.new_time)}
                                className="flex-1 py-2 rounded-lg text-sm font-bold transition active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F4E4BA)', color: '#1A1A1A' }}
                              >
                                承諾する
                              </button>
                              <button
                                onClick={() => handleProposalResponse(false)}
                                className="flex-1 py-2 rounded-lg text-sm font-bold border border-gray-600 text-gray-300 hover:bg-gray-800 transition"
                              >
                                別の時間を希望
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef}></div>
              </div>

              {/* Chat Input (Disabled for demo) */}
              <div className="bg-white border-t border-gray-100 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="メニューからお選びください"
                    disabled
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-400"
                  />
                  <button disabled className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                    ↑
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
