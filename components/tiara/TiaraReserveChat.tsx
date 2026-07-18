'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { StitchShell } from '@/components/tiara/StitchShell'
import { TIARA_RESERVE_COURSES } from '@/lib/tiara-courses'

type Step = 'cast' | 'course' | 'time' | 'phone' | 'confirm' | 'waiting'

const COURSES = TIARA_RESERVE_COURSES

const TIMES = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']

type CastOption = { id: string | number; name: string; crm_cast_id?: string | number }

type Props = {
  preselectedCastId?: string | null
  casts?: CastOption[]
}

export function TiaraReserveChat({ preselectedCastId, casts = [] }: Props) {
  const [step, setStep] = useState<Step>('cast')
  const [selectedCast, setSelectedCast] = useState<CastOption | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<(typeof COURSES)[0] | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [phone, setPhone] = useState('')
  const [usePoints, setUsePoints] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const pollRef = useRef<number | null>(null)

  useEffect(() => {
    if (preselectedCastId && casts.length > 0) {
      const found = casts.find((c) => String(c.id) === preselectedCastId || String(c.crm_cast_id) === preselectedCastId)
      if (found) {
        setSelectedCast(found)
        setStep('course')
      }
    }
  }, [preselectedCastId, casts])

  useEffect(() => {
    if (!bookingId || !phone) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/tiara/bookings/${bookingId}?phone=${encodeURIComponent(phone)}`)
        if (!res.ok) return
        const data = await res.json()
        const st = data.booking?.status ?? data.status
        if (st === 'confirmed') {
          setStatusMsg('✨ ご予約が確定いたしました。お時間までお待ちください。')
        } else if (st === 'rejected') {
          setStatusMsg('誠に申し訳ございません。別のお時間をご検討ください。')
        }
      } catch {
        // ignore
      }
    }

    poll()
    pollRef.current = window.setInterval(poll, 5000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [bookingId, phone])

  const submit = async () => {
    if (!selectedCast || !selectedCourse || !selectedTime || phone.replace(/[^0-9]/g, '').length < 10) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/tiara/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapist: {
            id: selectedCast.crm_cast_id ?? selectedCast.id,
            name: selectedCast.name,
            crm_cast_id: selectedCast.crm_cast_id ?? selectedCast.id,
          },
          course: selectedCourse,
          startTime: selectedTime,
          phone: phone.replace(/[^0-9]/g, ''),
          usePoints,
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'failed')
      setBookingId(String(body.orderId ?? body.bookingId))
      setStep('waiting')
    } catch (e) {
      setError(e instanceof Error ? e.message : '送信に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StitchShell active="reserve">
      <div className="max-w-lg mx-auto px-margin-mobile py-section-padding pb-28">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">ご予約</h1>
        <p className="text-label-sm text-secondary mb-6">THE TIARA — 西船橋</p>

        {step === 'waiting' ? (
          <div className="bg-white rounded-2xl border border-outline-subtle p-6 text-center space-y-3">
            <p className="text-3xl">✨</p>
            <p className="font-bold text-primary-dark">ご予約リクエストを承りました</p>
            <p className="text-sm text-secondary">
              {selectedCast?.name} / {selectedCourse?.name} / {selectedTime}〜
            </p>
            {statusMsg && <p className="text-sm font-bold text-emerald-700">{statusMsg}</p>}
            {!statusMsg && <p className="text-xs text-secondary">確定までしばらくお待ちください…</p>}
            <Link href="/" className="inline-block text-sm text-primary underline mt-4">トップへ</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-outline-subtle shadow-sm p-5 space-y-5">
            {step === 'cast' && (
              <>
                <p className="text-sm font-bold text-on-surface">セラピストを選択</p>
                <div className="grid gap-2">
                  {casts.length === 0 ? (
                    <p className="text-sm text-secondary">出勤情報を読み込み中…</p>
                  ) : (
                    casts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedCast(c); setStep('course') }}
                        className="text-left px-4 py-3 rounded-xl border border-outline-subtle hover:border-primary font-bold"
                      >
                        {c.name}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            {step === 'course' && selectedCast && (
              <>
                <p className="text-sm text-secondary">指名: <span className="font-bold text-on-surface">{selectedCast.name}</span></p>
                <p className="text-sm font-bold text-on-surface">コースを選択</p>
                <div className="grid gap-2">
                  {COURSES.map((co) => (
                    <button
                      key={`${co.name}-${co.time}-${co.price}`}
                      type="button"
                      onClick={() => { setSelectedCourse(co); setStep('time') }}
                      className="text-left px-4 py-3 rounded-xl border border-outline-subtle hover:border-primary relative"
                    >
                      {co.popular && (
                        <span className="absolute right-3 top-3 text-[10px] font-bold text-primary">人気</span>
                      )}
                      <span className="font-bold">{co.name}</span>
                      <span className="text-sm text-secondary ml-2">¥{co.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'time' && (
              <>
                <p className="text-sm font-bold text-on-surface">ご希望時間</p>
                <div className="flex flex-wrap gap-2">
                  {TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setSelectedTime(t); setStep('phone') }}
                      className="px-4 py-2 rounded-full border border-outline-subtle text-sm font-bold hover:border-primary"
                    >
                      {t}〜
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'phone' && (
              <>
                <p className="text-sm font-bold text-on-surface">お電話番号</p>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09012345678"
                  className="w-full border border-outline-subtle rounded-xl px-4 py-3 text-center tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  disabled={phone.replace(/[^0-9]/g, '').length < 10}
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-40"
                >
                  次へ
                </button>
              </>
            )}

            {step === 'confirm' && selectedCast && selectedCourse && (
              <>
                <div className="text-sm space-y-1 bg-primary-container rounded-xl p-4 text-on-primary-container">
                  <p><span className="text-secondary">セラピスト:</span> {selectedCast.name}</p>
                  <p><span className="text-secondary">コース:</span> {selectedCourse.name}（{selectedCourse.time}）</p>
                  <p><span className="text-secondary">時間:</span> {selectedTime}〜</p>
                  <p><span className="text-secondary">電話:</span> {phone}</p>
                  <p className="font-bold text-primary-dark">
                    ¥{(selectedCourse.price - (usePoints ? 2000 : 0)).toLocaleString()}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
                  2,000pt利用（会員）
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50"
                >
                  {submitting ? '送信中…' : '予約を送信'}
                </button>
              </>
            )}

            {step !== 'cast' && (
              <button
                type="button"
                onClick={() => {
                  const order: Step[] = ['cast', 'course', 'time', 'phone', 'confirm']
                  const i = order.indexOf(step)
                  if (i > 0) setStep(order[i - 1])
                }}
                className="text-xs text-secondary underline"
              >
                戻る
              </button>
            )}
          </div>
        )}
      </div>
    </StitchShell>
  )
}
