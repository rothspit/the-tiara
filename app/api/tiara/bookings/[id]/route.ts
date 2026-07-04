import { NextRequest, NextResponse } from 'next/server'
import { fetchCrmBookingStatus } from '@/lib/crm-booking'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const orderId = parseInt(id, 10)
  const phone = new URL(request.url).searchParams.get('phone') || ''

  if (!orderId || phone.replace(/[^0-9]/g, '').length < 10) {
    return NextResponse.json({ error: 'phone required' }, { status: 400 })
  }

  try {
    const status = await fetchCrmBookingStatus(orderId, phone)
    return NextResponse.json({
      booking: {
        id: String(orderId),
        status: status.status,
        order_status: status.order_status,
        therapist_name: status.cast_name,
        requested_time: status.start_time,
      },
    })
  } catch {
    return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 })
  }
}

export async function PATCH() {
  return NextResponse.json(
    {
      error: 'deprecated',
      message: '予約の確定・キャンセルは CRM 管理画面で行ってください',
      crm_url: 'https://crm.st-online.jp',
    },
    { status: 410 },
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'deprecated', message: 'CRM管理画面でキャンセルしてください' },
    { status: 410 },
  )
}
