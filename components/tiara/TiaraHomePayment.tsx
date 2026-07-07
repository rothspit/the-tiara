const CARD_PAYMENT_URL =
  'https://payment.alij.ne.jp/service/vcat/auth?loginId=21931803&loginPass=lneu7045'

const CARD_BRANDS = ['VISA', 'Mastercard', 'JCB', 'AMEX', 'Diners'] as const

export function TiaraHomePayment() {
  return (
    <section className="py-section-padding px-margin-mobile max-w-container-max mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">お支払い方法</h2>
        <p className="text-label-sm text-secondary uppercase tracking-widest mt-1">Payment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-outline-subtle rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">credit_card</span>
            <h3 className="font-title-md text-title-md font-bold">クレジットカード</h3>
          </div>
          <p className="text-sm text-secondary mb-4 leading-relaxed">
            各種クレジットカードがご利用いただけます。簡単・便利なカード決済に対応しています。
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {CARD_BRANDS.map((brand) => (
              <span
                key={brand}
                className="bg-surface-variant text-xs font-bold px-3 py-1.5 rounded-lg text-on-surface"
              >
                {brand}
              </span>
            ))}
          </div>
          <p className="text-xs text-red-600 font-bold mb-4">※ カード決済は手数料 10％ がかかります</p>
          <a
            href={CARD_PAYMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-primary text-on-primary text-center font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            カード決済画面へ進む
          </a>
          <p className="text-[10px] text-secondary mt-2 text-center">
            決済前に金額をお電話にてご確認ください
          </p>
        </div>

        <div className="bg-white border border-outline-subtle rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF0033] text-white font-black text-sm">
              P
            </span>
            <h3 className="font-title-md text-title-md font-bold">PayPay</h3>
          </div>
          <div className="bg-[#FFF0F3] border border-[#FF0033]/20 rounded-xl p-4 mb-4">
            <p className="font-bold text-on-surface">PayPay 対応</p>
            <p className="text-sm text-secondary mt-1">ご来店時にスタッフへお申し付けください</p>
          </div>
          <p className="text-sm text-secondary leading-relaxed">
            クレジットカード・PayPayでのお支払いが可能です。カード決済は手数料10％がかかります。
          </p>
        </div>
      </div>
    </section>
  )
}
