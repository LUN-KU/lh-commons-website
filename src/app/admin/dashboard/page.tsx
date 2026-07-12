import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAllRegistrations, getCostRecords, getEventsWithMap, getAllMembers, computeStats } from '@/lib/adminData'
import DashboardCharts from './DashboardCharts'
import { isAdminCookie } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  if (!isAdminCookie(cookies().get('lh_admin')?.value)) {
    redirect('/admin')
  }

  let stats
  try {
    const [registrations, costRecords, { events, dateMap }, memberMap] = await Promise.all([
      getAllRegistrations(),
      getCostRecords(),
      getEventsWithMap(),
      getAllMembers(),
    ])
    stats = computeStats(registrations, costRecords, events, dateMap, memberMap)
  } catch {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Notion 資料暫時讀取失敗</h2>
        <p className="text-gray-400 text-sm mb-6">可能是 Notion 服務不穩，稍等一下重新整理即可，資料不會遺失。</p>
        <a href="/admin/dashboard" className="border border-gray-300 text-gray-600 text-sm px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors">
          重新載入
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-800">領航里 後台儀表板</h1>
          <p className="text-gray-400 text-sm mt-1">
            資料來源：Notion 報名名單 + 活動成本預估表
          </p>
        </div>
        <DashboardCharts stats={stats} />
      </div>
    </div>
  )
}
