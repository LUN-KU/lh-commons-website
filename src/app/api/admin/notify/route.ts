import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getUpcomingEvents, getAllRegistrations } from '@/lib/adminData'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = '領航里 <onboarding@resend.dev>'

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  const querySecret = req.nextUrl.searchParams.get('secret')
  const cookieVal = req.cookies.get('lh_admin')?.value
  const cronSecret = process.env.CRON_SECRET
  const adminSecret = process.env.ADMIN_SECRET

  return (
    (!!cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (!!adminSecret && querySecret === adminSecret) ||
    (!!adminSecret && cookieVal === adminSecret)
  )
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const events = await getUpcomingEvents(3)

  if (events.length === 0) {
    return NextResponse.json({ sent: 0, message: '沒有 3 天後的活動' })
  }

  const registrations = await getAllRegistrations()
  const active = registrations.filter(r => r.status === '已報名')

  let sent = 0
  const errors: string[] = []

  for (const event of events) {
    const eventRegs = active.filter(r => r.eventId === event.id)

    for (const reg of eventRegs) {
      try {
        await resend.emails.send({
          from: FROM,
          to: reg.memberEmail,
          subject: `【領航里】活動提醒：${event.name} 即將在 3 天後開始`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#1e40af">活動即將開始 ⏰</h2>
              <p style="color:#374151">Hi ${reg.memberName}，你報名的活動還有 <strong>3 天</strong>就要開始了！</p>
              <div style="background:#eff6ff;border-radius:12px;padding:20px;margin:16px 0">
                <p style="color:#1e40af;font-weight:bold;font-size:18px;margin:0 0 8px">${event.name}</p>
                ${event.date ? `<p style="color:#374151;margin:4px 0">📅 日期：${event.date}</p>` : ''}
                ${event.time ? `<p style="color:#374151;margin:4px 0">🕐 時間：${event.time}</p>` : ''}
                ${event.location ? `<p style="color:#374151;margin:4px 0">📍 地點：${event.location}</p>` : ''}
              </div>
              <p style="color:#6b7280;font-size:14px">如有任何問題，歡迎私訊聯絡：</p>
              <p style="color:#6b7280;font-size:14px">Line：@850frpmp　IG：@l.h_commons</p>
            </div>
          `,
        })
        sent++
      } catch (e: any) {
        errors.push(`${reg.memberEmail}: ${e.message}`)
      }
    }
  }

  return NextResponse.json({
    sent,
    events: events.map(e => e.name),
    errors: errors.length > 0 ? errors : undefined,
  })
}
