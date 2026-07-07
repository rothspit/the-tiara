/** Vercel 本番（stitch 版）の料金表 — git には未コミットだった正本 */

export type TiaraMenuItem = {
  name: string
  description?: string
  duration: string
  price: number
  featured?: boolean
}

/** @deprecated 予約互換用。表示は TIARA_MENU_ITEMS を使う */
export type TiaraCourse = {
  name: string
  time: string
  price: number
  popular?: boolean
}

export const TIARA_MENU_ITEMS: TiaraMenuItem[] = [
  {
    name: 'コミコミ',
    description: 'ディープリンパ・ホットオイル・ノンオイル込み',
    duration: '90分',
    price: 18000,
    featured: true,
  },
  {
    name: 'オイルマッサージ',
    description: '当日フリーのみ',
    duration: '60分',
    price: 12000,
  },
  {
    name: 'オイルマッサージ',
    description: '基本的なオイルマッサージ',
    duration: '90分',
    price: 15000,
  },
  {
    name: 'オイルマッサージ',
    description: '基本的なオイルマッサージ',
    duration: '120分',
    price: 20000,
  },
]

/** 予約フロー用（CRM 送信の course_name / 分数） */
export const TIARA_RESERVE_COURSES = TIARA_MENU_ITEMS.map((item) => ({
  name: item.featured ? `コミコミ ${item.duration}` : `${item.name} ${item.duration}`,
  time: item.duration,
  price: item.price,
  popular: item.featured,
}))

export const TIARA_PRICING_NOTES = [
  '指名料 ¥1,000（別途）／ 入会金 無料',
  '延長は30分毎に¥6,000にて承ります。',
  '単体オプション（鼠蹊部マッサージ等）はコミコミコースなら無料です。',
  'クレジットカード・PayPayでのお支払いが可能です。カード決済は手数料10％がかかります。',
] as const

export const TIARA_PAYMENT_BADGES = ['VISA', 'Mastercard', 'JCB', 'AMEX', 'Diners', 'PayPay'] as const
