import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getMemberPointsByEmail, addMemberPoints } from '@/lib/members'
import { findEventByRedeemCode } from '@/lib/notion'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  let body: { code?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 })
  }
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
  if (!code) {
    return NextResponse.json({ error: 'MISSING_CODE' }, { status: 400 })
  }

  let event, member
  try {
    event = await findEventByRedeemCode(code)
    member = await getMemberPointsByEmail(session.user.email)
  } catch {
    return NextResponse.json({ error: 'SERVICE' }, { status: 503 })
  }

  if (!member) {
    return NextResponse.json({ error: 'NOT_MEMBER' }, { status: 404 })
  }
  if (!event) {
    return NextResponse.json({ error: 'INVALID_CODE' }, { status: 404 })
  }
  if (event.expired) {
    return NextResponse.json({ error: 'EXPIRED' }, { status: 410 })
  }
  if (member.redeemedEvents.includes(event.id)) {
    return NextResponse.json({ error: 'ALREADY_REDEEMED' }, { status: 409 })
  }

  try {
    await addMemberPoints(member, event.id, event.points)
  } catch {
    return NextResponse.json({ error: 'SERVICE' }, { status: 503 })
  }

  return NextResponse.json({
    ok: true,
    points: event.points,
    balance: member.balance + event.points,
    eventName: event.name,
  })
}
