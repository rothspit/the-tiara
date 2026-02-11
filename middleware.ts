import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/admin/:path*'], // /admin 以下の全ページにロックをかける
}

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    // 環境変数からID・パスワードを取得（Vercelで設定）
    const validUser = process.env.BASIC_AUTH_USER || 'admin'
    const validPass = process.env.BASIC_AUTH_PASS || 'password'

    if (user === validUser && pwd === validPass) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Auth Required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"',
    },
  })
}
