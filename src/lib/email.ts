import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'ejej4093@gmail.com'
const SITE_URL = process.env.NEXTAUTH_URL || 'https://lh-commons-website.vercel.app'
const FROM = '領航里 <onboarding@resend.dev>'

export async function sendJoinNotification(params: {
  name: string
  email: string
  phone: string
  type: string
  seniorPlan?: string
  bankCode?: string
  ig?: string
  interests: string[]
  note?: string
}) {
  const { name, email, phone, type, seniorPlan, bankCode, ig, interests, note } = params
  const planLabel = type === 'senior'
    ? (seniorPlan === '2.0' ? '理想領航員 2.0（$1,980）' : '資深里民 1.0（$720）')
    : '一般里民'

  const approveUrl = `${SITE_URL}/api/approve?email=${encodeURIComponent(email)}&secret=${encodeURIComponent(process.env.ADMIN_SECRET!)}`

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `【領航里】新申請：${name}（${planLabel}）`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1e40af">新里民申請 🎉</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#6b7280;width:100px">姓名</td><td style="padding:8px;font-weight:bold">${name}</td></tr>
          <tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">Email</td><td style="padding:8px">${email}</td></tr>
          <tr><td style="padding:8px;color:#6b7280">電話</td><td style="padding:8px">${phone}</td></tr>
          <tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">IG</td><td style="padding:8px">${ig || '無'}</td></tr>
          <tr><td style="padding:8px;color:#6b7280">方案</td><td style="padding:8px;font-weight:bold;color:#1e40af">${planLabel}</td></tr>
          ${bankCode ? `<tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">匯款後五碼</td><td style="padding:8px;font-weight:bold">${bankCode}</td></tr>` : ''}
          <tr ${bankCode ? '' : 'style="background:#f9fafb"'}><td style="padding:8px;color:#6b7280">感興趣活動</td><td style="padding:8px">${interests.join('、')}</td></tr>
          ${note ? `<tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">備註</td><td style="padding:8px">${note}</td></tr>` : ''}
        </table>
        <a href="${approveUrl}"
           style="display:inline-block;background:#1e40af;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;margin-top:8px">
          ✅ 一鍵核准此申請
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          點擊後會自動更新 Notion 狀態並發通知信給申請者。
        </p>
      </div>
    `,
  })
}

export async function sendApprovalEmail(params: {
  name: string
  email: string
  type: string
  seniorPlan?: string
}) {
  const { name, email, type, seniorPlan } = params
  const isSenior = type === 'senior'
  const plan20 = seniorPlan === '2.0'
  const planLabel = isSenior
    ? (plan20 ? '理想領航員 2.0' : '資深里民 1.0')
    : '一般里民'

  const benefits = isSenior ? (plan20 ? `
    <li>全年活動最優先保留位 + 3 次主題許願權</li>
    <li>里民專屬活動優惠價</li>
    <li>合作活動、老師、店家專屬折扣</li>
    <li>私密線下聚會（非資深不得參加）</li>
    <li>不定期驚喜好禮、優惠禮券</li>
    <li>1hr 理想生活復盤（設計思考 × 里長）</li>
    <li>1hr 專業財務諮詢（顧問式資產盤點）</li>
  ` : `
    <li>里民專屬活動優惠價</li>
    <li>合作活動、老師、店家專屬折扣</li>
    <li>私密線下聚會（非資深不得參加）</li>
    <li>不定期驚喜好禮、優惠禮券</li>
  `) : `
    <li>參加所有公開里民活動</li>
    <li>加入里民交流社群</li>
  `

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `歡迎加入領航里！你的${planLabel}申請已通過 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1e40af">Hi ${name}，歡迎加入領航里！ 🎉</h2>
        <p style="color:#374151">你的 <strong>${planLabel}</strong> 申請已通過審核。</p>
        <div style="background:#eff6ff;border-radius:12px;padding:16px;margin:16px 0">
          <p style="color:#1e40af;font-weight:bold;margin:0 0 8px">你的會員福利：</p>
          <ul style="color:#374151;margin:0;padding-left:20px;line-height:1.8">
            ${benefits}
          </ul>
        </div>
        <p style="color:#374151">
          會員期限自你「第一次」參與里民活動起計算一年，權益完整保障。
        </p>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb">
          <p style="color:#6b7280;font-size:14px;margin:0">有任何問題，歡迎私訊聯絡我們：</p>
          <p style="color:#6b7280;font-size:14px;margin:4px 0">Line：@850frpmp　IG：@l.h_commons</p>
        </div>
      </div>
    `,
  })
}
