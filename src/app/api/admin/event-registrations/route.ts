import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations, getAllMembers, getEventsWithMap } from '@/lib/adminData'

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

  const [allRegistrations, memberMap, { events }] = await Promise.all([
    getAllRegistrations(),
    getAllMembers(),
    getEventsWithMap(),
  ])

  // 找到本場活動的費用設定
  const ev = events.find(e => e.id === eventId) ?? events.find(e => e.name === eventName)

  const active = allRegistrations.filter(r => r.status === '已報名')

  // 找出此活動的報名者
  const eventRegs = active.filter(r =>
    r.eventId ? r.eventId === eventId : r.eventName === eventName
  )

  // 判斷回流
  const returningEmails = new Set<string>()
  for (const r of active) {
    const isSameEvent = r.eventId ? r.eventId === eventId : r.eventName === eventName
    if (isSameEvent) continue
    const regDate = r.registrationDate?.slice(0, 10) ?? ''
    if (regDate && regDate < eventDate) {
      returningEmails.add(r.memberEmail)
    }
  }

  let calculatedRevenue = 0
  const hasFees = ev && (ev.feeGeneral > 0 || ev.feeSenior > 0)

  const participants = eventRegs.map(r => {
    const memberType = memberMap.get(r.memberEmail) ?? '一般里民'
    let fee = 0
    if (ev) {
      fee = memberType === '資深里民' && ev.feeSenior > 0
        ? ev.feeSenior
        : ev.feeGeneral > 0
          ? ev.feeGeneral
          : 0
    }
    if (hasFees) calculatedRevenue += fee

    return {
      name: r.memberName,
      email: r.memberEmail,
      registrationDate: r.registrationDate,
      isReturning: returningEmails.has(r.memberEmail),
      memberType,
      fee,
    }
  })

  return NextResponse.json({
    participants,
    calculatedRevenue: hasFees ? calculatedRevenue : null,
    feeGeneral: ev?.feeGeneral ?? 0,
    feeSenior: ev?.feeSenior ?? 0,
  })
}
