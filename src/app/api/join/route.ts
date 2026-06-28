import { Client } from '@notionhq/client'
import { NextRequest, NextResponse } from 'next/server'
import { sendJoinNotification } from '@/lib/email'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DATABASE_ID!

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const type = typeof body.type === 'string' ? body.type : ''
  const seniorPlan = typeof body.seniorPlan === 'string' ? body.seniorPlan : ''
  const name = typeof body.name === 'string' ? body.name : ''
  const nickname = typeof body.nickname === 'string' ? body.nickname : ''
  const gender = typeof body.gender === 'string' ? body.gender : ''
  const birthday = typeof body.birthday === 'string' ? body.birthday : ''
  const ig = typeof body.ig === 'string' ? body.ig : ''
  const email = typeof body.email === 'string' ? body.email : ''
  const phone = typeof body.phone === 'string' ? body.phone : ''
  const bankCode = typeof body.bankCode === 'string' ? body.bankCode : ''
  const note = typeof body.note === 'string' ? body.note : ''
  const interests = Array.isArray(body.interests) ? (body.interests as string[]) : []

  if (!name || !nickname || !gender || !email || !phone || !interests.length || !type) {
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

  // 備註加入方案資訊
  const planLabel = type === 'senior'
    ? (seniorPlan === '2.0' ? '【理想領航員 2.0】' : '【資深里民 1.0】')
    : ''
  const fullNote = planLabel ? `${planLabel}\n${note || ''}`.trim() : (note || '')

  const properties: Record<string, unknown> = {
    '姓名': { title: [{ text: { content: name } }] },
    'Email': { email },
    '綽號': { rich_text: [{ text: { content: nickname } }] },
    '性別': { select: { name: gender } },
    'IG帳號': { rich_text: [{ text: { content: ig || '無' } }] },
    '電話': { rich_text: [{ text: { content: phone } }] },
    '感興趣活動': { rich_text: [{ text: { content: interests.join('、') } }] },
    '備註': { rich_text: [{ text: { content: fullNote } }] },
    '申請時間': { date: { start: new Date().toISOString() } },
    '狀態': { select: { name: '待審核' } },
    '身份': { select: { name: type === 'senior' ? '資深里民' : '一般里民' } },
    '排序': { number: type === 'senior' ? 1 : 3 },
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

  // 發通知給管理員（non-blocking）
  sendJoinNotification({ name, email, phone, type, seniorPlan, bankCode, ig, interests, note }).catch(console.error)

  return NextResponse.json({ ok: true })
}
