import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const COST_TABLE_DB = '3806dc6ec222815c9984d8714f482a77'
const EVENTS_DB = process.env.NOTION_EVENTS_DB_ID!

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('lh_admin')?.value
  if (!cookie || cookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 查 cost records 的 eventId 和日期
  const costRes: any = await notion.databases.query({
    database_id: COST_TABLE_DB,
    page_size: 20,
    sorts: [{ property: '日期', direction: 'descending' }],
  })
  const costSample = costRes.results.map((p: any) => ({
    name: p.properties['名稱']?.title?.map((t: any) => t.plain_text).join(''),
    date: p.properties['日期']?.date?.start,
    eventId: p.properties['活動ID']?.relation?.[0]?.id ?? null,
  }))

  // 查 events DB 的 ID 和日期
  const evRes: any = await notion.databases.query({
    database_id: EVENTS_DB,
    page_size: 20,
    sorts: [{ property: '日期', direction: 'descending' }],
  })
  const eventSample = evRes.results.map((p: any) => ({
    id: p.id,
    name: p.properties['活動名稱']?.title?.map((t: any) => t.plain_text).join(''),
    date: p.properties['日期']?.date?.start?.slice(0, 10),
  }))

  return NextResponse.json({ costSample, eventSample })
}
