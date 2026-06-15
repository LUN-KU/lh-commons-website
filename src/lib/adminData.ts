import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const REGISTRATIONS_DB = process.env.NOTION_REGISTRATIONS_DATABASE_ID!
const EVENTS_DB = process.env.NOTION_DATABASE_ID!
const COST_TABLE_DB = '3806dc6e-c222-815c-9984-d8714f482a77'

export type Registration = {
  eventId: string
  eventName: string
  memberEmail: string
  memberName: string
  registrationDate: string
  status: '已報名' | '已取消'
}

export type CostRecord = {
  id: string
  name: string
  eventDate: string
  targetCount: number
  totalCost: number
  totalRevenue: number
  netProfit: number
  grossMargin: string | null
  note: string
}

export type DashboardStats = {
  achievementData: {
    name: string
    date: string
    target: number
    actual: number
    rate: number | null
    matched: boolean
    hasCost: boolean
  }[]
  plData: {
    name: string
    date: string
    cost: number
    revenue: number
    netProfit: number
    grossMargin: string
  }[]
  monthlyRevenue: { month: string; revenue: number }[]
  returnRateData: { month: string; new: number; returning: number }[]
  summary: {
    totalRegistrations: number
    uniqueMembers: number
    totalNetProfit: number
    latestMonthRevenue: number
  }
}

function getProp(prop: any, type: string): string | number | null {
  if (!prop) return type === 'number' ? 0 : ''
  if (prop.type === 'rich_text') return prop.rich_text?.map((t: any) => t.plain_text).join('') ?? ''
  if (prop.type === 'title') return prop.title?.map((t: any) => t.plain_text).join('') ?? ''
  if (prop.type === 'select') return prop.select?.name ?? ''
  if (prop.type === 'date') return prop.date?.start ?? ''
  if (prop.type === 'number') return prop.number ?? 0
  if (prop.type === 'formula') {
    if (prop.formula?.type === 'number') return prop.formula.number ?? null
    if (prop.formula?.type === 'string') return prop.formula.string ?? ''
  }
  return type === 'number' ? 0 : ''
}

export async function getAllRegistrations(): Promise<Registration[]> {
  const results: Registration[] = []
  let cursor: string | undefined

  do {
    const res: any = await notion.databases.query({
      database_id: REGISTRATIONS_DB,
      page_size: 100,
      start_cursor: cursor,
    })
    for (const page of res.results as any[]) {
      const p = page.properties
      results.push({
        eventId: getProp(p['活動ID'], 'text') as string,
        eventName: getProp(p['活動名稱'], 'text') as string,
        memberEmail: getProp(p['里民Email'], 'text') as string,
        memberName: getProp(p['姓名'], 'text') as string,
        registrationDate: getProp(p['報名時間'], 'date') as string,
        status: getProp(p['狀態'], 'text') as '已報名' | '已取消',
      })
    }
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)

  return results
}

export async function getCostRecords(): Promise<CostRecord[]> {
  const res: any = await notion.databases.query({
    database_id: COST_TABLE_DB,
    page_size: 100,
    sorts: [{ property: '活動日期', direction: 'descending' }],
  })

  return (res.results as any[]).map((page: any) => {
    const p = page.properties
    const totalCost = getProp(p['總成本'], 'number') as number
    const totalRevenue = getProp(p['總收入'], 'number') as number
    const netProfit = totalRevenue - totalCost
    const grossMargin = totalRevenue > 0
      ? `${Math.round((netProfit / totalRevenue) * 1000) / 10}%`
      : null

    return {
      id: page.id,
      name: getProp(p['活動名稱'], 'text') as string,
      eventDate: getProp(p['活動日期'], 'date') as string,
      targetCount: getProp(p['目標人數'], 'number') as number,
      totalCost,
      totalRevenue,
      netProfit,
      grossMargin,
      note: getProp(p['備註'], 'text') as string,
    }
  })
}

export type EventInfo = {
  id: string
  name: string
  date: string
}

// 取得所有活動（含名稱），同時建立 日期→活動 對應表
export async function getEventsWithMap(): Promise<{ events: EventInfo[]; dateMap: Map<string, EventInfo> }> {
  const events: EventInfo[] = []
  const dateMap = new Map<string, EventInfo>()
  let cursor: string | undefined

  do {
    const res: any = await notion.databases.query({
      database_id: EVENTS_DB,
      page_size: 100,
      start_cursor: cursor,
      sorts: [{ property: '日期', direction: 'descending' }],
    })
    for (const page of res.results as any[]) {
      const date = page.properties['日期']?.date?.start?.slice(0, 10)
      const name = page.properties['活動名稱']?.title?.map((t: any) => t.plain_text).join('') ?? ''
      if (date && name) {
        const ev: EventInfo = { id: page.id, name, date }
        events.push(ev)
        dateMap.set(date, ev)
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)

  return { events, dateMap }
}

export async function getUpcomingEvents(daysAhead: number) {
  const target = new Date()
  target.setDate(target.getDate() + daysAhead)
  const dateStr = target.toISOString().slice(0, 10)

  const res: any = await notion.databases.query({
    database_id: EVENTS_DB,
    filter: { property: '日期', date: { equals: dateStr } },
  })

  return (res.results as any[]).map((page: any) => ({
    id: page.id,
    name: page.properties['活動名稱']?.title?.map((t: any) => t.plain_text).join('') ?? '',
    date: page.properties['日期']?.date?.start ?? null,
    location: page.properties['地點']?.rich_text?.map((t: any) => t.plain_text).join('') ?? '',
    time: page.properties['時間']?.rich_text?.map((t: any) => t.plain_text).join('') ?? '',
  }))
}

export function computeStats(
  registrations: Registration[],
  costRecords: CostRecord[],
  events: EventInfo[],
  dateMap: Map<string, EventInfo>
): DashboardStats {
  const active = registrations.filter(r => r.status === '已報名')

  // Group active registrations by event ID
  const byEventId = new Map<string, number>()
  for (const r of active) {
    byEventId.set(r.eventId, (byEventId.get(r.eventId) ?? 0) + 1)
  }

  // Cost records keyed by date for quick lookup
  const costByDate = new Map<string, CostRecord>()
  for (const c of costRecords) {
    if (c.eventDate) costByDate.set(c.eventDate.slice(0, 10), c)
  }

  // Achievement rate — all events as primary source, cost records as supplement
  const achievementData = events
    .slice(0, 20)
    .map(ev => {
      const actual = byEventId.get(ev.id) ?? 0
      const cost = costByDate.get(ev.date)
      return {
        name: ev.name,
        date: ev.date,
        target: cost?.targetCount ?? 0,
        actual,
        rate: cost?.targetCount ? Math.round((actual / cost.targetCount) * 100) : null,
        matched: true,
        hasCost: !!cost,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)

  // P&L — events as primary, fill in cost data where available
  const plData = events
    .map(ev => {
      const cost = costByDate.get(ev.date)
      if (!cost) return null
      return {
        name: ev.name,
        date: ev.date,
        cost: cost.totalCost,
        revenue: cost.totalRevenue,
        netProfit: cost.netProfit,
        grossMargin: cost.grossMargin ?? '-',
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)

  // Monthly revenue (last 12 months)
  const monthRevMap = new Map<string, number>()
  for (const c of costRecords) {
    if (!c.eventDate) continue
    const month = c.eventDate.slice(0, 7)
    monthRevMap.set(month, (monthRevMap.get(month) ?? 0) + c.netProfit)
  }
  const monthlyRevenue = Array.from(monthRevMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, revenue]) => ({ month, revenue }))

  // Return rate — find each member's first registration month
  const memberFirst = new Map<string, string>()
  for (const r of [...active].sort((a, b) => a.registrationDate.localeCompare(b.registrationDate))) {
    if (!memberFirst.has(r.memberEmail)) {
      memberFirst.set(r.memberEmail, r.registrationDate.slice(0, 7))
    }
  }

  const monthMemberMap = new Map<string, Set<string>>()
  for (const r of active) {
    const month = r.registrationDate.slice(0, 7)
    if (!monthMemberMap.has(month)) monthMemberMap.set(month, new Set())
    monthMemberMap.get(month)!.add(r.memberEmail)
  }

  const returnRateData = Array.from(monthMemberMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, members]) => {
      let newCount = 0, returningCount = 0
      Array.from(members).forEach(email => {
        memberFirst.get(email) === month ? newCount++ : returningCount++
      })
      return { month, new: newCount, returning: returningCount }
    })

  const totalNetProfit = plData.reduce((s, p) => s + p.netProfit, 0)
  const latestMonthRevenue = monthlyRevenue.at(-1)?.revenue ?? 0

  return {
    achievementData,
    plData,
    monthlyRevenue,
    returnRateData,
    summary: {
      totalRegistrations: active.length,
      uniqueMembers: Array.from(new Set(active.map(r => r.memberEmail))).length,
      totalNetProfit,
      latestMonthRevenue,
    },
  }
}
