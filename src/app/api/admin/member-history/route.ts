import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations, getEventsWithMap } from '@/lib/adminData'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('lh_admin')?.value
  if (!cookie || cookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const cutoff = sixMonthsAgo.toISOString().slice(0, 10)

  const [allRegistrations, { events }] = await Promise.all([getAllRegistrations(), getEventsWithMap()])
  const eventMap = new Map(events.map(e => [e.id, e]))
  const nameMap = new Map(events.map(e => [e.name, e]))

  const history = allRegistrations
    .filter(r => r.memberEmail === email && r.status === '已報名')
    .map(r => {
      const ev = r.eventId ? eventMap.get(r.eventId) : nameMap.get(r.eventName)
      const eventDate = ev?.date ?? r.registrationDate.slice(0, 10)
      return {
        eventName: ev?.name ?? r.eventName,
        eventDate,
        registrationDate: r.registrationDate,
      }
    })
    // 用活動日期做6個月截止，而不是報名時間（報名時間可能是空的）
    .filter(h => !h.eventDate || h.eventDate >= cutoff)
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate))

  return NextResponse.json({ email, history })
}
