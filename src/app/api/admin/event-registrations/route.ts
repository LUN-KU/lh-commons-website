import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations } from '@/lib/adminData'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('lh_admin')?.value
  if (!cookie || cookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const eventId = req.nextUrl.searchParams.get('eventId')
  const eventDate = req.nextUrl.searchParams.get('eventDate') // YYYY-MM
  if (!eventId || !eventDate) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const allRegistrations = await getAllRegistrations()
  const active = allRegistrations.filter(r => r.status === '已報名')

  // 找出此活動的報名者
  const eventRegs = active.filter(r => r.eventId === eventId)

  // 判斷回流：此月前曾參加過任何活動的 email 集合
  const currentMonth = eventDate.slice(0, 7) // YYYY-MM
  const returningEmails = new Set<string>()
  for (const r of active) {
    const regMonth = r.registrationDate.slice(0, 7)
    if (regMonth < currentMonth) {
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
