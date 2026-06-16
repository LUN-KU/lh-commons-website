import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations } from '@/lib/adminData'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('lh_admin')?.value
  if (!cookie || cookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const eventId = req.nextUrl.searchParams.get('eventId')
  const eventDate = req.nextUrl.searchParams.get('eventDate') // YYYY-MM-DD
  const eventName = req.nextUrl.searchParams.get('eventName') ?? ''
  if (!eventId || !eventDate) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const allRegistrations = await getAllRegistrations()
  const active = allRegistrations.filter(r => r.status === '已報名')

  // 找出此活動的報名者（精準比對 eventId，fallback 到 eventName）
  const eventRegs = active.filter(r =>
    r.eventId ? r.eventId === eventId : r.eventName === eventName
  )

  // 判斷回流：這場活動日期之前，曾參加過其他活動的 email
  const returningEmails = new Set<string>()
  for (const r of active) {
    const isSameEvent = r.eventId ? r.eventId === eventId : r.eventName === eventName
    if (isSameEvent) continue
    const regDate = r.registrationDate.slice(0, 10)
    if (regDate < eventDate) {
      returningEmails.add(r.memberEmail)
    }
  }

  const participants = eventRegs.map(r => ({
    name: r.memberName,
    email: r.memberEmail,
    registrationDate: r.registrationDate,
    isReturning: returningEmails.has(r.memberEmail),
  }))

  return NextResponse.json({ participants })
}
