import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations, getEventsWithMap } from '@/lib/adminData'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('lh_admin')?.value
  if (!cookie || cookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [registrations, { events }] = await Promise.all([getAllRegistrations(), getEventsWithMap()])
  const active = registrations.filter(r => r.status === '已報名')

  return NextResponse.json({
    sampleRegistrations: active.slice(0, 5).map(r => ({ eventId: r.eventId, eventName: r.eventName, status: r.status })),
    sampleEvents: events.slice(0, 5).map(e => ({ id: e.id, name: e.name })),
    totalActive: active.length,
  })
}
