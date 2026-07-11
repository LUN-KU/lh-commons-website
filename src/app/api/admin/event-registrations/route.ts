import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations, getAllMembers, getEventsWithMap } from '@/lib/adminData'
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

  // 建立活動日期查詢表（用於 registrationDate 為空的舊資料）
  const eventIdToDate = new Map<string, string>(events.map(e => [e.id, e.date]))
  const eventNameToDate = new Map<string, string>(events.map(e => [e.name, e.date]))

  function getEffectiveDate(r: { eventId: string; eventName: string; registrationDate: string }): string {
    // 優先用活動日期（活動實際發生時間），與 member-history 一致，避免提前報名未來活動被誤判回流
    if (r.eventId && eventIdToDate.has(r.eventId)) return eventIdToDate.get(r.eventId)!
    if (r.eventName && eventNameToDate.has(r.eventName)) return eventNameToDate.get(r.eventName)!
    if (r.registrationDate) return r.registrationDate.slice(0, 10)
    return ''
  }

  // 找到本場活動的費用設定（三重驗證：ID → 日期確認 → 名稱+日期）
  let ev = events.find(e => e.id === eventId)
  if (ev && ev.date !== eventDate) ev = events.find(e => e.name === eventName && e.date === eventDate) ?? ev
  if (!ev) ev = events.find(e => e.name === eventName && e.date === eventDate)

  // 同名活動列表（由舊到新），用於推斷舊報名歸屬
  const sameNameEvents = events.filter(e => e.name === eventName).sort((a, b) => a.date.localeCompare(b.date))
  const isEarliestOccurrence = sameNameEvents[0]?.id === eventId

  const active = allRegistrations.filter(r => r.status === '已報名')

  // 找出此活動的報名者：有 eventId 精準比對；無 eventId 用名字+日期推斷
  const eventRegs = active.filter(r => {
    if (r.eventId) return r.eventId === eventId
    if (r.eventName !== eventName) return false
    // 舊報名無 eventId：有報名時間則找最近的未來場，無則歸最舊場
    const regDate = r.registrationDate?.slice(0, 10)
    if (regDate) {
      const attributed = sameNameEvents.find(e => e.date >= regDate) ?? sameNameEvents[sameNameEvents.length - 1]
      return attributed?.id === eventId
    }
    return isEarliestOccurrence
  })

  // 判斷回流：用活動日期（而非報名時間）做比較，因為舊資料報名時間為空
  const returningEmails = new Set<string>()
  for (const r of active) {
    const isSameEvent = r.eventId ? r.eventId === eventId : r.eventName === eventName
    if (isSameEvent) continue
    const date = getEffectiveDate(r)
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
