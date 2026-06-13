import { Client } from '@notionhq/client'
import { NextRequest, NextResponse } from 'next/server'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DATABASE_ID!

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, name, nickname, gender, birthday, ig, email, phone, interests, bankCode, note } = body

  if (!name || !nickname || !gender || !email || !phone || !interests?.length || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (type === 'senior' && !bankCode) {
    return NextResponse.json({ error: 'Missing bankCode' }, { status: 400 })
  }

  // 查重複 email
  const existing = await notion.databases.query({
    database_id: MEMBERS_DB_ID,
    filter: { property: 'Email', email: { equals: email } },
  })
  if (existing.results.length > 0) {
    return NextResponse.json({ duplicate: true })
  }

  const properties: Record<string, unknown> = {
    '姓名': { title: [{ text: { content: name } }] },
    'Email': { email },
    '綽號': { rich_text: [{ text: { content: nickname } }] },
    '性別': { select: { name: gender } },
    'IG帳號': { rich_text: [{ text: { content: ig || '無' } }] },
    '電話': { rich_text: [{ text: { content: phone } }] },
    '感興趣活動': { rich_text: [{ text: { content: interests.join('、') } }] },
    '備註': { rich_text: [{ text: { content: note || '' } }] },
    '申請時間': { date: { start: new Date().toISOString() } },
    '狀態': { select: { name: '待審核' } },
    '身份': { select: { name: type === 'senior' ? '資深里民' : '一般里民' } },
  }

  if (birthday) {
    properties['生日'] = { date: { start: birthday } }
  }
  if (bankCode) {
    properties['匯款後五碼'] = { rich_text: [{ text: { content: bankCode } }] }
  }

  await notion.pages.create({
    parent: { database_id: MEMBERS_DB_ID },
    properties: properties as Parameters<typeof notion.pages.create>[0]['properties'],
  })

  return NextResponse.json({ ok: true })
}
