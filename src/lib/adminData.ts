import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const REGISTRATIONS_DB = process.env.NOTION_REGISTRATIONS_DATABASE_ID!
const EVENTS_DB = process.env.NOTION_DATABASE_ID!
const MEMBERS_DB = process.env.NOTION_MEMBERS_DATABASE_ID!
const COST_TABLE_DB = '3806dc6e-c222-815c-9984-d8714f482a77'

export type Registration = {
  eventId: string
  eventName: string
  memberEmail: string
  memberName: string
  registrationDate: string
  eventDate?: string
  status: '已報名' | '已取消'
}

export type CostRecord = {
  id: string
  name: string
  category: '活動' | '個人服務' | '其他'
  eventId: string | null
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
    eventId: string
    name: string
    date: string
    target: number
    actual: number
    rate: number | null
    matched: boolean
    hasCost: boolean
  }[]
  plData: {
    eventId: string | null
    name: string
    date: string
    category: string
    cost: number
    revenue: number
    autoRevenue: number
    registrationCount: number
    hasFees: boolean
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
        eventId: (getProp(p['活動ID'], 'text') as string).trim(),
        eventName: (getProp(p['活動名稱'], 'text') as string).trim(),
        memberEmail: (getProp(p['里民Email'], 'text') as string).trim().toLowerCase(),
        memberName: (getProp(p['姓名'], 'text') as string).trim(),
        registrationDate: getProp(p['報名時間'], 'date') as string,
        eventDate: getProp(p['活動日期'], 'date') as string | undefined,
        status: getProp(p['狀態'], 'text') as '已報名' | '已取消',
      })
    }
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)

  return results
}

export async function getCostRecords(): Promise<CostRecord[]> {
  const allResults: any[] = []
  let cursor: string | undefined

  do {
    const res: any = await notion.databases.query({
      database_id: COST_TABLE_DB,
      page_size: 100,
      start_cursor: cursor,
      sorts: [{ property: '活動日期', direction: 'descending' }],
    })
    allResults.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)

  return allResults.map((page: any) => {
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
      category: (getProp(p['類別'], 'text') as string || '活動') as CostRecord['category'],
      eventId: getProp(p['活動ID'], 'text') as string || null,
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

function parseFee(text: string): number {
  const match = text.replace(/,/g, '').match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

export type EventInfo = {
  id: string
  name: string
  date: string
  feeGeneral: number   // 一般里民費用
  feeSenior: number    // 資深里民費用
  feeEarly: number     // 早鳥里民費用
  targetCount: number  // 目標人數（活動資料庫）
}

export type MemberInfo = {
  email: string
  memberType: '一般里民' | '資深里民'
}

// ── 活動歸屬共用邏輯（三重驗證：名稱＋ID＋日期）──
// 所有「這筆報名屬於哪場活動」的判斷都必須走這裡，禁止各處自己寫比對

export type EventIndexes = {
  eventById: Map<string, EventInfo>
  eventsByName: Map<string, EventInfo[]> // 每個名稱下的場次，由舊到新排序
}

export function buildEventIndexes(events: EventInfo[]): EventIndexes {
  const eventById = new Map(events.map(e => [e.id, e]))
  const eventsByName = new Map<string, EventInfo[]>()
  for (const ev of events) {
    const list = eventsByName.get(ev.name)
    if (list) list.push(ev)
    else eventsByName.set(ev.name, [ev])
  }
  eventsByName.forEach(list => list.sort((a, b) => a.date.localeCompare(b.date)))
  return { eventById, eventsByName }
}

// 把一筆報名歸屬到唯一場次：
// 1. 有活動ID且找得到 → 直接歸屬
// 2. 否則用名稱找場次列表：單一場次直接歸屬；多場次依報名日期找最近的未來場，無報名日期歸最舊場
export function attributeRegistration(r: Registration, idx: EventIndexes): EventInfo | undefined {
  if (r.eventId) {
    const ev = idx.eventById.get(r.eventId)
    if (ev) return ev
  }
  const evList = idx.eventsByName.get(r.eventName)
  if (!evList || evList.length === 0) return undefined
  if (evList.length === 1) return evList[0]
  const regDate = r.registrationDate?.slice(0, 10)
  return (regDate ? evList.find(e => e.date >= regDate) : undefined) ?? evList[0]
}

// 取得所有會員身份 email → memberType
export async function getAllMembers(): Promise<Map<string, '一般里民' | '資深里民'>> {
  const map = new Map<string, '一般里民' | '資深里民'>()
  let cursor: string | undefined
  do {
    const res: any = await notion.databases.query({
      database_id: MEMBERS_DB,
      page_size: 100,
      start_cursor: cursor,
      filter: { property: '狀態', select: { equals: '啟用' } },
    })
    for (const page of res.results as any[]) {
      const email = (page.properties['Email']?.email ?? '').trim().toLowerCase()
      const type = page.properties['身份']?.select?.name ?? '一般里民'
      if (email) map.set(email, type as '一般里民' | '資深里民')
    }
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return map
}

// 取得所有活動（含費用），同時建立 日期→活動 對應表
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
      const p = page.properties
      const date = p['日期']?.date?.start?.slice(0, 10)
      const name = p['活動名稱']?.title?.map((t: any) => t.plain_text).join('') ?? ''
      if (date && name) {
        const feeGeneral = parseFee(p['一般里民費用']?.rich_text?.map((t: any) => t.plain_text).join('') ?? '')
        const feeSenior = parseFee(p['資深里民費用']?.rich_text?.map((t: any) => t.plain_text).join('') ?? '')
        const feeEarly = parseFee(p['早鳥里民費用']?.rich_text?.map((t: any) => t.plain_text).join('') ?? '')
        // 若個別費用未填，從「費用說明」抓單一費用當備援
        const feeDesc = parseFee(p['費用說明']?.rich_text?.map((t: any) => t.plain_text).join('') ?? '')
        const ev: EventInfo = {
          id: page.id,
          name,
          date,
          feeGeneral: feeGeneral > 0 ? feeGeneral : feeDesc,
          feeSenior: feeSenior > 0 ? feeSenior : feeDesc,
          feeEarly,
          targetCount: (p['目標人數']?.number as number) ?? 0,
        }
        events.push(ev)
        dateMap.set(date, ev)
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)

  return { events, dateMap }
}

// 自動把活動資料庫的活動同步到品牌損益追蹤（若已存在則跳過）
export async function syncEventsToBrandPL(): Promise<{ created: number; skipped: number }> {
  const { events } = await getEventsWithMap()

  // 取得已存在的活動ID清單（分頁讀全部，避免超過 100 筆時建立重複資料）
  const existingResults: any[] = []
  let cursor: string | undefined
  do {
    const existing: any = await notion.databases.query({
      database_id: COST_TABLE_DB,
      page_size: 100,
      start_cursor: cursor,
      filter: { property: '類別', select: { equals: '活動' } },
    })
    existingResults.push(...existing.results)
    cursor = existing.has_more ? existing.next_cursor : undefined
  } while (cursor)
  const existingEventIds = new Set(
    existingResults
      .map((p: any) => p.properties['活動ID']?.rich_text?.[0]?.plain_text)
      .filter(Boolean)
  )

  let created = 0
  let skipped = 0

  for (const ev of events) {
    if (existingEventIds.has(ev.id)) {
      skipped++
      continue
    }
    await notion.pages.create({
      parent: { database_id: COST_TABLE_DB },
      properties: {
        '活動名稱': { title: [{ text: { content: ev.name } }] },
        '活動日期': { date: { start: ev.date } },
        '類別': { select: { name: '活動' } },
        '活動ID': { rich_text: [{ text: { content: ev.id } }] },
      },
    })
    created++
  }

  return { created, skipped }
}

export async function getUpcomingEvents(daysAhead: number) {
  const target = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
  // 以台灣時區取日期，避免 UTC 偏移導致提醒差一天
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(target)

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
  dateMap: Map<string, EventInfo>,
  memberMap: Map<string, '一般里民' | '資深里民'> = new Map()
): DashboardStats {
  const active = registrations.filter(r => r.status === '已報名')

  // 共用歸屬索引：每筆報名唯一歸屬到一場活動（三重驗證）
  const idx = buildEventIndexes(events)
  const regAttribution = new Map<Registration, EventInfo | undefined>()
  const byEventId = new Map<string, number>()
  for (const r of active) {
    const ev = attributeRegistration(r, idx)
    regAttribution.set(r, ev)
    if (ev) byEventId.set(ev.id, (byEventId.get(ev.id) ?? 0) + 1)
  }

  // Cost records keyed by eventId (精準比對) 和 名稱+日期 (fallback)
  // 不可只用日期比對：同一天可能有多場不同活動
  const costByEventId = new Map<string, CostRecord>()
  const costByNameDate = new Map<string, CostRecord>()
  for (const c of costRecords) {
    if (c.eventId) costByEventId.set(c.eventId, c)
    if (c.eventDate) costByNameDate.set(`${c.name}|${c.eventDate.slice(0, 10)}`, c)
  }

  // Achievement rate — 目標人數優先取活動資料庫，損益表當備援
  const achievementData = events
    .map(ev => {
      const actual = byEventId.get(ev.id) ?? 0
      const cost = costByEventId.get(ev.id) ?? costByNameDate.get(`${ev.name}|${ev.date}`)
      const target = ev.targetCount > 0 ? ev.targetCount : (cost?.targetCount ?? 0)
      return {
        eventId: ev.id,
        name: ev.name,
        date: ev.date,
        target,
        actual,
        rate: target > 0 ? Math.round((actual / target) * 100) : null,
        matched: true,
        hasCost: !!cost,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  // Brand P&L — all cost records (活動 + 個人服務 + 其他)
  const plData = costRecords
    .map(c => {
      const costDate = c.eventDate?.slice(0, 10)
      // 先用 eventId 找，再驗證日期是否吻合；不吻合就改用名字+日期找正確的活動
      let ev = c.eventId ? events.find(e => e.id === c.eventId) : undefined
      if (ev && costDate && ev.date !== costDate) {
        ev = events.find(e => e.name === c.name && e.date === costDate) ?? ev
      }
      if (!ev) {
        ev = costDate
          ? events.find(e => e.name === c.name && e.date === costDate)
          : undefined
      }

      // 找到此活動的報名人數（用共用歸屬結果）
      const eventRegs = ev
        ? active.filter(r => regAttribution.get(r)?.id === ev!.id)
        : []
      const registrationCount = eventRegs.length

      // 自動算收入：有費用設定才算
      let autoRevenue = 0
      const hasFees = ev && (ev.feeGeneral > 0 || ev.feeSenior > 0)
      if (hasFees && ev) {
        for (const r of eventRegs) {
          const type = memberMap.get(r.memberEmail) ?? '一般里民'
          autoRevenue += type === '資深里民' && ev.feeSenior > 0 ? ev.feeSenior : ev.feeGeneral
        }
      }

      const revenue = c.totalRevenue > 0 ? c.totalRevenue : autoRevenue
      const netProfit = revenue - c.totalCost
      const grossMargin = revenue > 0 ? `${Math.round((netProfit / revenue) * 1000) / 10}%` : '-'

      return {
        eventId: c.eventId,
        name: ev?.name ?? c.name,
        date: c.eventDate,
        category: c.category,
        cost: c.totalCost,
        revenue: c.totalRevenue,
        autoRevenue,
        registrationCount,
        hasFees: !!hasFees,
        netProfit,
        grossMargin,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  // Monthly revenue (last 12 months) — 用有效收入（Notion 或 auto）
  const monthRevMap = new Map<string, number>()
  for (const row of plData) {
    if (!row.date) continue
    const month = row.date.slice(0, 7)
    monthRevMap.set(month, (monthRevMap.get(month) ?? 0) + row.netProfit)
  }
  const monthlyRevenue = Array.from(monthRevMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, revenue]) => ({ month, revenue }))

  // Return rate — 以每筆報名為單位計算
  // 用歸屬活動的日期當時間基準（活動實際發生時間），因為舊資料報名時間為空
  function getEffectiveDate(r: Registration): string {
    const ev = regAttribution.get(r)
    if (ev) return ev.date
    if (r.registrationDate) return r.registrationDate.slice(0, 10)
    return ''
  }

  const memberSeen = new Set<string>()
  const returnRateByMonth = new Map<string, { new: number; returning: number }>()

  const sortedActive = [...active].sort((a, b) => {
    const da = getEffectiveDate(a) || '9999'
    const db = getEffectiveDate(b) || '9999'
    return da.localeCompare(db)
  })

  for (const r of sortedActive) {
    const date = getEffectiveDate(r)
    if (!date) continue
    const month = date.slice(0, 7)
    if (!returnRateByMonth.has(month)) returnRateByMonth.set(month, { new: 0, returning: 0 })
    const bucket = returnRateByMonth.get(month)!
    if (memberSeen.has(r.memberEmail)) {
      bucket.returning++
    } else {
      bucket.new++
      memberSeen.add(r.memberEmail)
    }
  }

  const returnRateData = Array.from(returnRateByMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, counts]) => ({ month, new: counts.new, returning: counts.returning }))

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
