import {
  TIARA_MENU_ITEMS,
  TIARA_PAYMENT_BADGES,
  TIARA_PRICING_NOTES,
} from '@/lib/tiara-site-content'

export function PriceListTiara() {
  return (
    <div className="px-margin-mobile py-section-padding max-w-container-max mx-auto">
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2 text-center">
        施術メニュー・料金
      </h1>
      <p className="text-label-sm text-secondary uppercase tracking-widest mb-8 text-center">System</p>

      <div className="space-y-4 max-w-lg mx-auto">
        {TIARA_MENU_ITEMS.map((item) => (
          <div
            key={`${item.name}-${item.duration}-${item.price}`}
            className={
              item.featured
                ? 'bg-primary text-on-primary p-5 rounded-xl flex justify-between items-center shadow-md relative overflow-hidden'
                : 'bg-white border border-outline-subtle p-5 rounded-xl flex justify-between items-center shadow-sm'
            }
          >
            {item.featured && (
              <div className="absolute top-0 right-0 bg-white/20 px-3 py-1 rounded-bl-lg text-[10px] font-bold">
                人気NO.1
              </div>
            )}
            <div className="pr-3">
              <p className="font-bold">
                {item.featured ? `コミコミ ${item.duration}` : `${item.name} ${item.duration}`}
              </p>
              {item.description && (
                <p className={`text-xs mt-1 ${item.featured ? 'opacity-80' : 'text-secondary'}`}>
                  {item.description}
                </p>
              )}
            </div>
            <p className={`font-bold text-xl tabular-nums shrink-0 ${item.featured ? '' : 'text-primary'}`}>
              {item.duration} / ¥{item.price.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary-container rounded-xl border border-outline-subtle text-xs leading-relaxed text-on-primary-container space-y-1.5 max-w-lg mx-auto">
        {TIARA_PRICING_NOTES.map((note) => (
          <p key={note}>※ {note}</p>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
        {TIARA_PAYMENT_BADGES.map((badge) => (
          <span
            key={badge}
            className="bg-surface-variant border border-outline-subtle text-[10px] font-bold px-2.5 py-1 rounded text-on-surface"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  )
}
