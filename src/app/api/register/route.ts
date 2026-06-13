import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { registerForEvent } from '@/lib/members'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { eventId, eventName, paymentNote } = await req.json()
  if (!eventId || !eventName || !paymentNote) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const result = await registerForEvent(
    eventId,
    eventName,
    session.user.email,
    session.user.name ?? '',
    paymentNote
  )

  return NextResponse.json(result)
}
