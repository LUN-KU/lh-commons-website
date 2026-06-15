import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAllRegistrations, getCostRecords, getEventsWithMap, computeStats } from '@/lib/adminData'
import DashboardCharts from './DashboardCharts'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const token = cookies().get('lh_admin')?.value
  if (!token || token !== process.env.ADMIN_SECRET) {
    redirect('/admin')
  }

  const [registrations, costRecords, { events, dateMap }] = await Promise.all([
    getAllRegistrations(),
    getCostRecords(),
    getEventsWithMap(),
  ])

  const stats = computeStats(registrations, costRecords, events, dateMap)

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
