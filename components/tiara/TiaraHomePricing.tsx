import Link from 'next/link'
import {
  TIARA_MENU_ITEMS,
  TIARA_PRICING_NOTES,
} from '@/lib/tiara-site-content'

export function TiaraHomePricing() {
  return (
    <section className="py-section-padding px-margin-mobile max-w-container-max mx-auto">
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary text-center mb-8">
        施術メニュー・料金
      </h2>
      <div className="space-y-4">
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

      <div className="mt-6 p-4 bg-primary-container rounded-xl text-xs leading-relaxed text-on-primary-container space-y-1.5">
        {TIARA_PRICING_NOTES.map((note) => (
          <p key={note}>※ {note}</p>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/system"
          className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:opacity-80"
        >
          料金・オプションの詳細を見る
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>
    </section>
  )
}
