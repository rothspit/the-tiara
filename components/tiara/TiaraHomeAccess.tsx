import Image from 'next/image'

export function TiaraHomeAccess() {
  return (
    <section id="access" className="py-section-padding px-margin-mobile bg-surface-variant">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">アクセス</h2>
          <p className="text-label-sm text-secondary uppercase tracking-widest mt-1">
            Nishi-Funabashi Station
          </p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-subtle">
          <div className="relative h-48 bg-gray-200">
            <Image
              src="/cast/3.png"
              alt="西船橋駅周辺"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">train</span>
                <span className="font-bold text-on-surface">西船橋駅 北口 徒歩3分</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">directions_walk</span>
              <p className="text-sm text-on-surface">JR西船橋駅 北口を出て徒歩3分程度</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">schedule</span>
              <p className="text-sm text-on-surface">12:00 〜 翌05:00（年中無休）</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">phone_iphone</span>
              <a href="tel:05017438883" className="text-sm font-bold text-primary">
                050-1743-8883
              </a>
            </div>
            <a
              href="https://maps.google.com/?q=西船橋駅"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined">map</span>
              Google Mapで見る
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
