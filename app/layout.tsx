import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSans = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'ティアラ | 西船橋メンズエステ',
  description: '西船橋のメンズエステ「ティアラ」。癒しと非日常を、あなただけのお時間に。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,1"
          rel="stylesheet"
        />
      </head>
      <body className={`${notoSans.variable} antialiased font-sans`}>{children}</body>
    </html>
  )
}
