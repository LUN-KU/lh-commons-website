'use client'
import { useState } from 'react'

type Props = {
  name: string
  balance: number
  total: number
}

function levelOf(total: number): { label: string; color: string } {
  if (total >= 300) return { label: '金里民', color: 'text-amber-300' }
  if (total >= 100) return { label: '銀里民', color: 'text-slate-200' }
  return { label: '銅里民', color: 'text-orange-300' }
}

const ERROR_MESSAGES: Record<string, string> = {
  MISSING_CODE: '請輸入活動密碼',
  INVALID_CODE: '密碼錯誤，請確認是否輸入正確',
  EXPIRED: '此密碼已過集點時間',
  ALREADY_REDEEMED: '這場活動你已經集過點了',
  NOT_MEMBER: '找不到你的會員資料，請確認登入的 Email',
  SERVICE: '系統忙碌中，請稍後再試',
}

export default function PointsCard({ name, balance: initialBalance, total: initialTotal }: Props) {
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
        <p className={`text-xs font-bold mb-4 ${level.color === 'text-slate-200' ? 'text-slate-500' : level.color.replace('300', '500')}`}>
          {level.label}
        </p>
        <p className="text-6xl font-black text-brand-700 tracking-tight">{balance}</p>
        <p className="text-sm text-gray-400 mt-2">目前可用點數</p>
        <p className="text-xs text-gray-300 mt-1">累積點數 {total}</p>
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
    </div>
  )
}
