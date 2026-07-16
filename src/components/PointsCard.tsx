'use client'
import { useState } from 'react'

type Props = {
  name: string
  balance: number
  total: number
  monthlyGranted?: number
}

function levelOf(total: number): { label: string; className: string } {
  if (total >= 700) return { label: '里長特助', className: 'text-amber-500' }
  if (total >= 300) return { label: '鄰長', className: 'text-violet-500' }
  if (total >= 100) return { label: '里民幹事', className: 'text-brand-600' }
  return { label: '一般里民', className: 'text-gray-500' }
}

const ERROR_MESSAGES: Record<string, string> = {
  MISSING_CODE: '請輸入活動密碼',
  INVALID_CODE: '密碼錯誤，請確認是否輸入正確',
  EXPIRED: '此密碼已過集點時間',
  ALREADY_REDEEMED: '這場活動你已經集過點了',
  NOT_MEMBER: '找不到你的會員資料，請確認登入的 Email',
  SERVICE: '系統忙碌中，請稍後再試',
}

export default function PointsCard({ name, balance: initialBalance, total: initialTotal, monthlyGranted = 0 }: Props) {
  const [balance, setBalance] = useState(initialBalance)
  const [total, setTotal] = useState(initialTotal)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const level = levelOf(total)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (res.ok) {
        setBalance(data.balance)
        setTotal(t => t + data.points)
        setSuccess(`集點成功！「${data.eventName}」+${data.points} 點`)
        setCode('')
      } else {
        setError(ERROR_MESSAGES[data.error] ?? '集點失敗，請稍後再試')
      }
    } catch {
      setError('系統忙碌中，請稍後再試')
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
        <p className="text-sm text-gray-400 mb-1">{name}</p>
        <p className={`text-xs font-bold mb-4 ${level.className}`}>
          {level.label}
        </p>
        <p className="text-6xl font-black text-brand-700 tracking-tight">{balance}</p>
        <p className="text-sm text-gray-400 mt-2">目前可用點數</p>
        <p className="text-xs text-gray-300 mt-1">累積點數 {total}</p>
        {monthlyGranted > 0 && (
          <p className="text-xs text-emerald-600 font-semibold mt-3">
            本月資深里民點數 +{monthlyGranted} 已入帳
          </p>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-brand-800 font-black text-base mb-1">活動集點</h2>
        <p className="text-xs text-gray-400 mb-4">輸入活動現場公布的密碼即可集點</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="例：LH0704-8K2P"
            autoCapitalize="characters"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-center tracking-widest focus:outline-none focus:border-brand-400"
          />
          {success && <p className="text-sm text-emerald-600 text-center font-semibold">{success}</p>}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={submitting || code.trim().length === 0}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-40"
          >
            {submitting ? '集點中...' : '集點'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-brand-800 font-black text-base mb-3">等級制度</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">一般里民</span><span className="text-gray-400">0–99 點</span></div>
          <div className="flex justify-between"><span className="text-brand-600 font-semibold">里民幹事</span><span className="text-gray-400">100–299 點</span></div>
          <div className="flex justify-between"><span className="text-violet-500 font-semibold">鄰長</span><span className="text-gray-400">300–699 點</span></div>
          <div className="flex justify-between"><span className="text-amber-500 font-semibold">里長特助</span><span className="text-gray-400">700 點以上</span></div>
        </div>
        <p className="text-xs text-gray-300 mt-3">等級依累積點數計算，兌換不影響等級</p>
      </div>

      <div className="bg-white/10 rounded-3xl p-6">
        <h2 className="text-white/80 font-bold text-sm mb-2">點數機制適用範圍</h2>
        <p className="text-xs text-white/50 leading-relaxed">
          本點數機制適用於「里長自辦／官方核心活動」（如桌遊、讀書會、沙龍、主題式交流活動等）；外部合作揪團（如密室逃脫、劇本殺、一日遊、興趣培養、匹克球）因涉及外部場館與第三方合作，暫不參與點數累積與兌換。
        </p>
        <p className="text-xs text-white/50 leading-relaxed mt-2">
          可集點的活動會直接在活動頁標示點數。
        </p>
      </div>
    </div>
  )
}
