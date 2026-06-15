import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const REGISTRATIONS_DB = process.env.NOTION_REGISTRATIONS_DATABASE_ID!
const EVENTS_DB = process.env.NOTION_DATABASE_ID!
const COST_TABLE_DB = '1c76dc6e-c222-8124-8925-f3c7f8896242'

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
  costPreTax: number
  netProfit: number | null
  grossMargin: string | null
  memberRevenue: number | null
}

export type DashboardStats = {
  achievementData: {
    name: string
    date: string
    target: number
    actual: number
    rate: number | null
    matched: boolean
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
    return {
      id: page.id,
      name: getProp(p['項目'], 'text') as string,
      eventDate: getProp(p['活動日期'], 'date') as string,
      targetCount: getProp(p['人數'], 'number') as number,
      costPreTax: getProp(p['✏總成本（未稅）'], 'number') as number,
      netProfit: p['淨利']?.formula?.number ?? null,
      grossMargin: p['毛利率（%）']?.formula?.string ?? null,
      memberRevenue: p['總收入（會員）']?.formula?.number ?? null,
    }
  })
}

// 取得所有活動的 日期 → eventId 對應表（用於自動比對達成率）
export async function getEventDateMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  let cursor: string | undefined

  do {
    const res: any = await notion.databases.query({
      database_id: EVENTS_DB,
      page_size: 100,
      start_cursor: cursor,
    })
    for (const page of res.results as any[]) {
      const date = page.properties['日期']?.date?.start?.slice(0, 10)
      if (date) map.set(date, page.id)
    }
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)

  return map
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
  eventDateMap: Map<string, string>
): DashboardStats {
  const active = registrations.filter(r => r.status === '已報名')

  // Group active registrations by event ID
  const byEventId = new Map<string, number>()
  for (const r of active) {
    byEventId.set(r.eventId, (byEventId.get(r.eventId) ?? 0) + 1)
  }

  // Achievement rate — auto-match cost record date to event ID
  const achievementData = costRecords
    .filter(c => c.eventDate)
    .map(c => {
      const dateKey = c.eventDate.slice(0, 10)
      const eventId = eventDateMap.get(dateKey)
      const actual = eventId ? (byEventId.get(eventId) ?? 0) : 0
      return {
        name: c.name,
        date: c.eventDate,
        target: c.targetCount,
        actual,
        rate: c.targetCount > 0 ? Math.round((actual / c.targetCount) * 100) : null,
        matched: !!eventId,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)

  // P&L
  const plData = costRecords
    .filter(c => c.eventDate)
    .map(c => ({
      name: c.name,
      date: c.eventDate,
      cost: c.costPreTax,
      revenue: c.memberRevenue ?? 0,
      netProfit: c.netProfit ?? 0,
      grossMargin: c.grossMargin ?? '-',
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)

  // Monthly revenue (last 12 months)
  const monthRevMap = new Map<string, number>()
  for (const c of costRecords) {
    if (!c.eventDate || c.netProfit === null) continue
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
