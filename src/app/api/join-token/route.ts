import { NextResponse } from 'next/server'
import { makeJoinToken } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export function GET() {
  const token = makeJoinToken()
  if (!token) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  return NextResponse.json({ token })
}
