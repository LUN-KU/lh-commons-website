import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { registerForEvent } from '@/lib/members'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { eventId?: string; eventName?: string; paymentNote?: string; eventDate?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { eventId, eventName, paymentNote, eventDate } = body
  if (!eventId || !eventName || !paymentNote) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const result = await registerForEvent(
    eventId,
    eventName,
    session.user.email,
    session.user.name ?? '',
    paymentNote,
    eventDate
  )

  return NextResponse.json(result)
}
