import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations, getAllMembers, getEventsWithMap, buildEventIndexes, attributeRegistration } from '@/lib/adminData'
import { isAdminCookie } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  if (!isAdminCookie(req.cookies.get('lh_admin')?.value)) {
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

  const idx = buildEventIndexes(events)

  // 找到本場活動（三重驗證：ID → 日期確認 → 名稱+日期）
  let ev = idx.eventById.get(eventId)
  if (ev && ev.date !== eventDate) ev = events.find(e => e.name === eventName && e.date === eventDate) ?? ev
  if (!ev) ev = events.find(e => e.name === eventName && e.date === eventDate)

  const active = allRegistrations.filter(r => r.status === '已報名')

  // 每筆報名用共用邏輯歸屬到唯一場次
  const attribution = new Map(active.map(r => [r, attributeRegistration(r, idx)]))

  // 本場活動的報名者
  const eventRegs = active.filter(r => attribution.get(r)?.id === eventId)

  // 回流判斷：此人是否參加過「更早日期」的其他場次（含同名活動的先前場次）
  const returningEmails = new Set<string>()
  for (const r of active) {
    const attributed = attribution.get(r)
    if (attributed?.id === eventId) continue
    const date = attributed?.date ?? r.registrationDate?.slice(0, 10) ?? ''
    if (date && date < eventDate) {
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
