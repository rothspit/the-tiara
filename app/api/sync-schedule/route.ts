import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/** Phase 2: CRM が正本。legacy Supabase push は CRM 側 legacy_push_enabled=false で停止済み。 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error: 'deprecated',
      message: 'Use CRM API pull. Legacy Supabase sync is disabled.',
    },
    { status: 410 },
  )
}
