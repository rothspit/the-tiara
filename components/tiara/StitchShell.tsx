import Image from 'next/image'
import Link from 'next/link'

type Props = {
  active?: 'home' | 'cast' | 'system' | 'reserve'
  children: React.ReactNode
}

export function StitchShell({ active = 'home', children }: Props) {
  const navClass = (key: string) =>
    key === active
      ? 'text-primary font-semibold'
      : 'text-secondary hover:text-primary'

  return (
    <div className="bg-white text-on-surface min-h-screen pb-24">
      <header className="fixed top-0 w-full h-16 z-50 bg-white border-b border-outline-subtle flex justify-between items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-icon.png" alt="" width={32} height={32} className="h-8 w-auto" />
          <Image
            src="/logo-wordmark.png"
            alt="ティアラ"
            width={100}
            height={24}
            className="h-6 w-auto hidden sm:block"
          />
        </Link>
        <nav className="hidden md:flex gap-6 text-xs uppercase tracking-wider">
          <Link href="/" className={navClass('home')}>ホーム</Link>
          <Link href="/cast" className={navClass('cast')}>キャスト</Link>
          <Link href="/system" className={navClass('system')}>料金</Link>
        </nav>
        <Link
          href="/reserve"
          className="text-primary"
          aria-label="予約"
        >
          <span className="material-symbols-outlined text-[28px]">calendar_month</span>
        </Link>
      </header>

      <div className="pt-16">{children}</div>

      <footer className="bg-surface-variant border-t border-outline-subtle mt-12 py-10 px-4 text-center text-sm text-secondary">
        <p>西船橋メンズエステ　ティアラ</p>
        <a href="tel:05017438883" className="text-primary font-bold text-lg mt-2 inline-block">
          050-1743-8883
        </a>
        <p className="text-[10px] mt-6">© 2026 ティアラ. All rights reserved.</p>
      </footer>

      <nav className="fixed bottom-0 w-full z-50 border-t border-outline-subtle bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-around max-w-lg mx-auto">
          <Link href="/" className={`flex flex-col items-center py-1.5 min-w-[52px] ${navClass('home')}`}>
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span className="text-[10px] mt-0.5">ホーム</span>
          </Link>
          <Link href="/cast" className={`flex flex-col items-center py-1.5 min-w-[52px] ${navClass('cast')}`}>
            <span className="material-symbols-outlined text-[22px]">groups</span>
            <span className="text-[10px] mt-0.5">キャスト</span>
          </Link>
          <a
            href="tel:05017438883"
            className="flex flex-col items-center -mt-6"
            aria-label="電話"
          >
            <span className="bg-primary text-on-primary w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl">phone_in_talk</span>
            </span>
          </a>
          <Link href="/system" className={`flex flex-col items-center py-1.5 min-w-[52px] ${navClass('system')}`}>
            <span className="material-symbols-outlined text-[22px]">payments</span>
            <span className="text-[10px] mt-0.5">料金</span>
          </Link>
          <Link href="/#schedule" className="flex flex-col items-center py-1.5 min-w-[52px] text-secondary">
            <span className="material-symbols-outlined text-[22px]">location_on</span>
            <span className="text-[10px] mt-0.5">アクセス</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
