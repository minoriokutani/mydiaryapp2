import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// これをそのまま貼り付けてください
export function middleware(request: NextRequest) {
  // ブラウザからの確認リクエスト（OPTIONS）への対応
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
      },
    })
  }

  const response = NextResponse.next()
  // 全ての通信を許可する設定を強制付与
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}

// 適用範囲の設定
export const config = {
  matcher: '/api/:path*',
}