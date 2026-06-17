'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts'
import type { DashboardStats } from '@/lib/adminData'

function fmt(n: number) {
  return n.toLocaleString('zh-TW')
}

type Participant = {
  name: string
  email: string
  registrationDate: string
  isReturning: boolean
  memberType: '一般里民' | '資深里民'
  fee: number
}

type MemberHistory = { eventName: string; eventDate: string }

function MemberHistoryModal({ name, email, onClose }: { name: string; email: string; onClose: () => void }) {
  const [history, setHistory] = useState<MemberHistory[] | null>(null)
  const [loading, setLoading] = useState(false)

  if (!history && !loading) {
    setLoading(true)
    fetch(`/api/admin/member-history?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => { setHistory(d.history ?? []); setLoading(false) })
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-brand-800">{name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">過去 6 個月活動紀錄</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {loading && <p className="text-gray-400 text-sm text-center py-6">載入中...</p>}
          {history?.length === 0 && <p className="text-gray-400 text-sm text-center py-6">無參加紀錄</p>}
          {history && history.length > 0 && (
            <ul className="space-y-2">
              {history.map((h, i) => (
                <li key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-sm text-gray-800 font-medium">{h.eventName}</p>
                  <p className="text-xs text-gray-400 shrink-0 ml-3">{h.eventDate}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function ParticipantModal({
  eventName, eventDate, eventId,
  notionRevenue, notionCost, notionNetProfit,
  onClose
}: {
  eventName: string
  eventDate: string
  eventId: string
  notionRevenue: number
  notionCost: number
  notionNetProfit: number
  onClose: () => void
}) {
  const [participants, setParticipants] = useState<Participant[] | null>(null)
  const [calculatedRevenue, setCalculatedRevenue] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [memberModal, setMemberModal] = useState<{ name: string; email: string } | null>(null)

  if (!participants && !loading) {
    setLoading(true)
    fetch(`/api/admin/event-registrations?eventId=${encodeURIComponent(eventId)}&eventDate=${encodeURIComponent(eventDate)}&eventName=${encodeURIComponent(eventName)}`)
      .then(r => r.json())
      .then(d => {
        setParticipants(d.participants ?? [])
        setCalculatedRevenue(d.calculatedRevenue ?? null)
        setLoading(false)
      })
  }

  const returningCount = participants?.filter(p => p.isReturning).length ?? 0
  const newCount = (participants?.length ?? 0) - returningCount
  const seniorCount = participants?.filter(p => p.memberType === '資深里民').length ?? 0
  const generalCount = (participants?.length ?? 0) - seniorCount

  return (
    <>
      {memberModal && (
        <MemberHistoryModal
          name={memberModal.name}
          email={memberModal.email}
          onClose={() => setMemberModal(null)}
        />
      )}
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-brand-800 text-lg">{eventName}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{eventDate}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            {participants && (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-full">共 {participants.length} 人</span>
                  {returningCount > 0 && <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full">回流 {returningCount} 人</span>}
                  {newCount > 0 && <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">新里民 {newCount} 人</span>}
                  {seniorCount > 0 && <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full">資深 {seniorCount} 人</span>}
                  {generalCount > 0 && <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">一般 {generalCount} 人</span>}
                </div>
                {/* Notion 實際損益 */}
                {notionRevenue > 0 || notionCost > 0 ? (
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">收入</p>
                      <p className="text-sm font-semibold text-gray-800">${fmt(notionRevenue)}</p>
                    </div>
                    <div className="text-center border-x border-gray-200">
                      <p className="text-xs text-gray-400">成本</p>
                      <p className="text-sm font-semibold text-gray-800">${fmt(notionCost)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">淨利</p>
                      <p className={`text-sm font-bold ${notionNetProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {notionNetProfit >= 0 ? '+' : ''}${fmt(notionNetProfit)}
                      </p>
                    </div>
                  </div>
                ) : calculatedRevenue !== null ? (
                  <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-green-600">試算收入</span>
                    <span className="text-base font-bold text-green-700">${fmt(calculatedRevenue)}</span>
                    <span className="text-xs text-gray-400 ml-auto">Notion 尚未填入損益</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <div className="overflow-y-auto flex-1 p-5">
            {loading && <p className="text-gray-400 text-sm text-center py-8">載入中...</p>}
            {participants?.length === 0 && <p className="text-gray-400 text-sm text-center py-8">尚無報名者</p>}
            {participants && participants.length > 0 && (
              <>
                <ul className="space-y-2">
                  {participants.map((p, i) => (
                    <li key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 ${p.isReturning ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}>
                      <button
                        className="text-left hover:opacity-70 transition-opacity"
                        onClick={() => setMemberModal({ name: p.name, email: p.email })}
                      >
                        <p className="text-sm font-medium text-gray-800 underline decoration-dotted underline-offset-2">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </button>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        {p.isReturning
                          ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">回流里民</span>
                          : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">新里民</span>
                        }
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.memberType === '資深里民' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.memberType}{p.fee > 0 ? ` $${fmt(p.fee)}` : ''}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-300 text-center mt-4">點擊姓名查看個人參加紀錄</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
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
    <button onClick={trigger} className="text-sm bg-brand-100 text-brand-700 px-4 py-2 rounded-lg hover:bg-brand-200 transition-colors">
      手動觸發 3 天提醒
    </button>
  )
}

function SyncButton() {
  async function sync() {
    const res = await fetch('/api/admin/sync-events', { method: 'POST' })
    const data = await res.json()
    if (data.created === 0) {
      alert('所有活動已同步，無需更新')
    } else {
      alert(`同步完成！新增 ${data.created} 筆活動到品牌損益追蹤`)
      window.location.reload()
    }
  }
  return (
    <button onClick={sync} className="text-sm bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
      同步活動到損益表
    </button>
  )
}

type ModalState = {
  eventId: string
  eventName: string
  eventDate: string
  notionRevenue: number
  notionCost: number
  notionNetProfit: number
} | null

export default function DashboardCharts({ stats }: { stats: DashboardStats }) {
  const { achievementData, plData, monthlyRevenue, returnRateData, summary } = stats
  const [modal, setModal] = useState<ModalState>(null)

  // 月份過濾 — 從資料中取得所有月份，預設最新月份
  const allMonths = Array.from(new Set([
    ...achievementData.map(e => e.date.slice(0, 7)),
    ...plData.map(p => p.date?.slice(0, 7)).filter(Boolean),
  ])).sort().reverse()
  const [selectedMonth, setSelectedMonth] = useState<string>(allMonths[0] ?? '')

  const filteredAchievement = selectedMonth
    ? achievementData.filter(e => e.date.startsWith(selectedMonth))
    : achievementData
  const filteredPL = selectedMonth
    ? plData.filter(p => p.date?.startsWith(selectedMonth))
    : plData

  function openModal(ev: typeof achievementData[0]) {
    const pl = plData.find(p => p.eventId === ev.eventId) ?? plData.find(p => p.name === ev.name)
    setModal({
      eventId: ev.eventId,
      eventName: ev.name,
      eventDate: ev.date,
      notionRevenue: pl?.revenue ?? 0,
      notionCost: pl?.cost ?? 0,
      notionNetProfit: pl?.netProfit ?? 0,
    })
  }

  return (
    <div className="space-y-8">
      {modal && (
        <ParticipantModal
          eventId={modal.eventId}
          eventName={modal.eventName}
          eventDate={modal.eventDate}
          notionRevenue={modal.notionRevenue}
          notionCost={modal.notionCost}
          notionNetProfit={modal.notionNetProfit}
          onClose={() => setModal(null)}
        />
      )}
      {/* Header actions */}
      <div className="flex justify-end gap-2">
        <SyncButton />
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

      {/* Month filter */}
      {allMonths.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {allMonths.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                selectedMonth === m
                  ? 'bg-brand-700 text-white border-brand-700'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Achievement rate */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-brand-800">活動達成率</h2>
          {filteredAchievement.length > 0 && !filteredAchievement.some(a => a.hasCost) && (
            <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full">
              請在 Notion「活動損益追蹤」填入各活動的成本與收入
            </span>
          )}
        </div>
        {filteredAchievement.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">此月份尚無活動資料</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAchievement.map((ev, i) => (
              <button
                key={i}
                onClick={() => openModal(ev)}
                className="border border-gray-100 rounded-xl p-4 text-left hover:border-brand-200 hover:shadow-sm transition-all cursor-pointer w-full"
              >
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
                <p className="text-xs text-gray-400 mt-2">{ev.hasCost ? '點擊查看名單' : '點擊查看名單・損益待填'}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* P&L table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-brand-800 mb-4">品牌損益明細</h2>
        {filteredPL.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">此月份尚無資料</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-left">
                  <th className="pb-2 font-medium">名稱</th>
                  <th className="pb-2 font-medium">類別</th>
                  <th className="pb-2 font-medium text-right">日期</th>
                  <th className="pb-2 font-medium text-right">收入</th>
                  <th className="pb-2 font-medium text-right">成本</th>
                  <th className="pb-2 font-medium text-right">淨利</th>
                  <th className="pb-2 font-medium text-right">毛利率</th>
                </tr>
              </thead>
              <tbody>
                {filteredPL.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 max-w-[180px] truncate">{row.name}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        row.category === '活動' ? 'bg-blue-50 text-blue-600' :
                        row.category === '個人服務' ? 'bg-purple-50 text-purple-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{row.category}</span>
                    </td>
                    <td className="py-2.5 text-right text-gray-500 text-xs">{row.date}</td>
                    <td className="py-2.5 text-right">{row.revenue > 0 ? `$${fmt(row.revenue)}` : '-'}</td>
                    <td className="py-2.5 text-right text-gray-600">{row.cost > 0 ? `$${fmt(row.cost)}` : '-'}</td>
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
