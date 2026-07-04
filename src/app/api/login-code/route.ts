import { NextRequest, NextResponse } from 'next/server'
import { getMemberByEmail } from '@/lib/members'
import { makeLoginCode } from '@/lib/adminAuth'
import { sendLoginCodeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  let member
  try {
    member = await getMemberByEmail(email)
  } catch {
    return NextResponse.json({ error: 'SERVICE' }, { status: 503 })
  }
  if (!member) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }
  if (member.status === '待審核') {
    return NextResponse.json({ error: 'PENDING' }, { status: 403 })
  }
  if (member.status !== '啟用') {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    await sendLoginCodeEmail(member.email, makeLoginCode(member.email))
  } catch {
    return NextResponse.json({ error: 'SERVICE' }, { status: 503 })
  }
  return NextResponse.json({ ok: true })
}
