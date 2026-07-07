import Image from 'next/image'
import Link from 'next/link'
import { StitchShell } from '@/components/tiara/StitchShell'
import { getAllTiaraCasts } from '@/lib/tiara-casts'

export default async function CastListPage() {
  const casts = await getAllTiaraCasts()

  return (
    <StitchShell active="cast">
      <div className="px-margin-mobile py-section-padding max-w-container-max mx-auto">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">セラピスト一覧</h1>
        <p className="text-label-sm text-secondary uppercase tracking-widest mb-8">Cast</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {casts.map((cast) => {
            const card = (
              <div className="rounded-xl overflow-hidden bg-white border border-outline-subtle shadow-sm">
                <div className="relative h-72 bg-surface-variant">
                  <Image
                    src={cast.image}
                    alt={cast.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized={cast.image.startsWith('/cast/')}
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-lg text-on-surface">
                    {cast.name}{' '}
                    <span className="text-sm font-normal text-secondary">（{cast.age}歳）</span>
                  </h2>
                  {cast.height && (
                    <p className="text-xs text-secondary mt-1">T{cast.height}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cast.tags.map((tag) => (
                      <span key={tag} className="bg-primary-container text-[10px] px-2 py-1 rounded text-on-primary-container">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {cast.isPlaceholder && (
                    <p className="text-[10px] text-secondary mt-2">※ 表示用（予約不可）</p>
                  )}
                </div>
              </div>
            )

            if (cast.isPlaceholder) {
              return <div key={cast.id}>{card}</div>
            }

            return (
              <Link key={cast.id} href={`/cast/${cast.id}`} className="block hover:opacity-95">
                {card}
              </Link>
            )
          })}
        </div>
      </div>
    </StitchShell>
  )
}
