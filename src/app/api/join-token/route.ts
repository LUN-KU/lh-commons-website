import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'

function makeToken(): string {
  const secret = process.env.ADMIN_SECRET ?? 'fallback-secret'
  const slot = Math.floor(Date.now() / (30 * 60 * 1000)) // 30分鐘一個 slot
  const sig = createHmac('sha256', secret).update(`join:${slot}`).digest('hex')
  return `${slot}:${sig}`
}

export function GET() {
  return NextResponse.json({ token: makeToken() })
}
