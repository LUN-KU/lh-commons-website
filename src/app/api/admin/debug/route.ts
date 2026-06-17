import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const EVENTS_DB = process.env.NOTION_EVENTS_DB_ID!

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('lh_admin')?.value
  if (!cookie || cookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res: any = await notion.databases.query({
    database_id: EVENTS_DB,
    page_size: 5,
    sorts: [{ property: '日期', direction: 'descending' }],
  })

  const sample = res.results.map((page: any) => {
    const p = page.properties
    return {
      name: p['活動名稱']?.title?.map((t: any) => t.plain_text).join(''),
      feeGeneralRaw: p['一般里民費用'],
      feeSeniorRaw: p['資深里民費用'],
      feeDescRaw: p['費用說明'],
    }
  })

  return NextResponse.json({ sample })
}
