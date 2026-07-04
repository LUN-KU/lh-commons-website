import { Client } from '@notionhq/client'
import { NextRequest, NextResponse } from 'next/server'
import { sendApprovalEmail, escapeHtml } from '@/lib/email'
import { isValidApproveSig } from '@/lib/adminAuth'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DATABASE_ID!

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const sig = searchParams.get('sig')

  if (!email || !isValidApproveSig(email, sig)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // 找到此 email 的里民
  const result = await notion.databases.query({
    database_id: MEMBERS_DB_ID,
    filter: { property: 'Email', email: { equals: email } },
  })

  if (result.results.length === 0) {
    return new NextResponse('Member not found', { status: 404 })
  }

  const page = result.results[0] as { id: string; properties: Record<string, unknown> }
  const props = page.properties as Record<string, {
    title?: { plain_text: string }[]
    select?: { name: string }
    rich_text?: { plain_text: string }[]
  }>

  const currentStatus = props['狀態']?.select?.name
  if (currentStatus === '啟用') {
    return new NextResponse(approvedPage(email, true), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // 更新狀態為啟用
  await notion.pages.update({
    page_id: page.id,
    properties: { '狀態': { select: { name: '啟用' } } },
  })

  // 取得成員資訊發通知信
  const name = props['姓名']?.title?.[0]?.plain_text ?? '里民'
  const identity = props['身份']?.select?.name ?? '一般里民'
  const note = props['備註']?.rich_text?.[0]?.plain_text ?? ''
  const seniorPlan = note.includes('2.0') ? '2.0' : '1.0'
  const type = identity === '資深里民' ? 'senior' : 'regular'

  sendApprovalEmail({ name, email, type, seniorPlan }).catch(console.error)

  return new NextResponse(approvedPage(email, false), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function approvedPage(rawEmail: string, alreadyApproved: boolean) {
  const email = escapeHtml(rawEmail)
  const title = alreadyApproved ? '已是啟用狀態' : '核准成功 ✅'
  const msg = alreadyApproved
    ? `${email} 的狀態已是「啟用」，無需重複操作。`
    : `${email} 已核准！Notion 狀態已更新為「啟用」，通知信已寄出。`
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f0f9ff}
    .box{background:white;border-radius:16px;padding:40px;max-width:480px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    h2{color:#1e40af;margin:0 0 12px}p{color:#6b7280;line-height:1.6}</style></head>
    <body><div class="box"><div style="font-size:48px">${alreadyApproved ? 'ℹ️' : '🎉'}</div>
    <h2>${title}</h2><p>${msg}</p></div></body></html>`
}
