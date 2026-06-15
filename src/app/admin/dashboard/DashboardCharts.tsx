'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LineChart, Line
} from 'recharts'
import type { DashboardStats } from '@/lib/adminData'

function fmt(n: number) {
  return n.toLocaleString('zh-TW')
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-brand-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function NotifyButton() {
  async function trigger() {
    const res = await fetch('/api/admin/notify')
    const data = await res.json()
    if (data.sent === 0) {
      alert(`沒有需要通知的活動（${data.message ?? '無 3 天後的活動'}）`)
    } else {
      alert(`已發送 ${data.sent} 封提醒信！\n活動：${data.events?.join('、')}`)
    }
  }

  return (
    <button
      onClick={trigger}
      className="text-sm bg-brand-100 text-brand-700 px-4 py-2 rounded-lg hover:bg-brand-200 transition-colors"
    >
      手動觸發 3 天提醒
    </button>
  )
}

export default function DashboardCharts({ stats }: { stats: DashboardStats }) {
  const { achievementData, plData, monthlyRevenue, returnRateData, summary } = stats
  const hasMatch = achievementData.some(a => a.matched)

  return (
    <div className="space-y-8">
      {/* Header actions */}
      <div className="flex justify-end">
        <NotifyButton />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="累計報名人次" value={fmt(summary.totalRegistrations)} />
        <SummaryCard label="不重複里民數" value={fmt(summary.uniqueMembers)} />
        <SummaryCard
          label="本月收益"
          value={`$${fmt(summary.latestMonthRevenue)}`}
          sub="來自活動成本預估表"
        />
        <SummaryCard
          label="總累計淨利"
          value={`$${fmt(summary.totalNetProfit)}`}
          sub="所有已記錄活動"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-brand-800 mb-4">每月淨利趨勢</h2>
          {monthlyRevenue.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">尚無資料</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v >= 1000 ? `${v / 1000}k` : v}`} />
                <Tooltip formatter={(v) => [`$${fmt(Number(v))}`, '淨利']} />
                <Bar dataKey="revenue" fill="#3B5BDB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Return rate */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-brand-800 mb-4">每月新里民 vs 回流里民</h2>
          {returnRateData.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">尚無資料</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={returnRateData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={10} />
                <Bar dataKey="new" name="新里民" fill="#91A7FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returning" name="回流里民" fill="#1B3472" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Achievement rate */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-brand-800">活動達成率</h2>
          {achievementData.length > 0 && !achievementData.some(a => a.hasCost) && (
            <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full">
              請在 Notion「活動損益追蹤」填入各活動的成本與收入
            </span>
          )}
        </div>
        {achievementData.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">尚無活動資料</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievementData.map((ev, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-800 truncate">{ev.name}</p>
                <p className="text-xs text-gray-400 mb-3">{ev.date}</p>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-xl font-bold text-brand-700">{ev.actual}</span>
                    {ev.target > 0 && (
                      <span className="text-gray-400 text-sm"> / {ev.target} 人</span>
                    )}
                  </div>
                  {ev.rate !== null && (
                    <span className={`text-sm font-semibold ${ev.rate >= 100 ? 'text-green-600' : ev.rate >= 70 ? 'text-brand-600' : 'text-orange-500'}`}>
                      {ev.rate}%
                    </span>
                  )}
                </div>
                {ev.target > 0 && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${ev.rate !== null && ev.rate >= 100 ? 'bg-green-500' : 'bg-brand-500'}`}
                      style={{ width: `${Math.min(ev.rate ?? 0, 100)}%` }}
                    />
                  </div>
                )}
                {!ev.hasCost && (
                  <p className="text-xs text-gray-400 mt-2">損益尚未填入</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* P&L table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-brand-800 mb-4">活動損益明細</h2>
        {plData.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">尚無資料</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-left">
                  <th className="pb-2 font-medium">活動名稱</th>
                  <th className="pb-2 font-medium text-right">日期</th>
                  <th className="pb-2 font-medium text-right">收入</th>
                  <th className="pb-2 font-medium text-right">成本</th>
                  <th className="pb-2 font-medium text-right">淨利</th>
                  <th className="pb-2 font-medium text-right">毛利率</th>
                </tr>
              </thead>
              <tbody>
                {plData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 max-w-[200px] truncate">{row.name}</td>
                    <td className="py-2.5 text-right text-gray-500 text-xs">{row.date}</td>
                    <td className="py-2.5 text-right">{row.revenue > 0 ? `$${fmt(row.revenue)}` : '-'}</td>
                    <td className="py-2.5 text-right text-gray-600">${fmt(row.cost)}</td>
                    <td className={`py-2.5 text-right font-medium ${row.netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {row.netProfit >= 0 ? '+' : ''}{`$${fmt(row.netProfit)}`}
                    </td>
                    <td className="py-2.5 text-right text-gray-500">{row.grossMargin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
