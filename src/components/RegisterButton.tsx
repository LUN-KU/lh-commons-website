'use client'
import { useSession, signIn } from 'next-auth/react'
import { useState } from 'react'
import PaymentInstructions from './PaymentInstructions'

type Props = {
  eventId: string
  eventName: string
  eventDate?: string
  eventStatus: string
  memberOnly: boolean
  isRegistered?: boolean
}

export default function RegisterButton({ eventId, eventName, eventDate, eventStatus, memberOnly, isRegistered }: Props) {
  const { data: session, status } = useSession()
  const [state, setState] = useState<'idle' | 'confirm' | 'success' | 'duplicate' | 'error'>(
    isRegistered ? 'duplicate' : 'idle'
  )
  const [submitting, setSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'linepay'>('bank')
  const [paymentNote, setPaymentNote] = useState('')

  const [loginStep, setLoginStep] = useState<'idle' | 'email' | 'code'>('idle')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginCode, setLoginCode] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  if (eventStatus === '已結束') {
    return (
      <div className="w-full text-center bg-white/10 text-white/30 font-bold py-4 rounded-2xl text-base">
        活動已結束
      </div>
    )
  }

  if (eventStatus === '額滿') {
    return (
      <div className="w-full text-center bg-white/20 text-white/50 font-bold py-4 rounded-2xl text-base">
        已額滿
      </div>
    )
  }

  if (eventStatus !== '報名中') return null

  if (status === 'loading') {
    return <div className="w-full h-14 bg-white/10 rounded-2xl animate-pulse" />
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setLoginStep('code')
      } else if (data.error === 'PENDING') {
        setLoginError('申請審核中，請等待管理員核准後再登入')
      } else if (data.error === 'SERVICE') {
        setLoginError('系統忙碌中，請稍後再試')
      } else {
        setLoginError('找不到此 Email，請確認是否已加入領航里')
      }
    } catch {
      setLoginError('系統忙碌中，請稍後再試')
    }
    setLoginLoading(false)
  }

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    const res = await signIn('email-login', { email: loginEmail, code: loginCode, redirect: false })
    setLoginLoading(false)
    if (res?.error) {
      if (res.error.includes('CODE')) {
        setLoginError('驗證碼錯誤或已過期，請重新輸入')
      } else if (res.error.includes('PENDING')) {
        setLoginError('申請審核中，請等待管理員核准後再登入')
      } else if (res.error.includes('SERVICE')) {
        setLoginError('系統忙碌中，請稍後再試')
      } else {
        setLoginError('找不到此 Email，請確認是否已加入領航里')
      }
    } else {
      setLoginStep('idle')
      setLoginEmail('')
      setLoginCode('')
    }
  }

  if (!session) {
    if (loginStep === 'idle') {
      return (
        <button
          onClick={() => setLoginStep('email')}
          className="block w-full text-center bg-white text-brand-800 font-bold py-4 rounded-2xl hover:bg-brand-50 transition-colors shadow-lg text-base"
        >
          登入後報名
        </button>
      )
    }

    return (
      <div className="bg-white rounded-2xl p-5 space-y-3 shadow-xl">
        {loginStep === 'email' ? (
          <form onSubmit={handleSendCode} className="space-y-2">
            <label className="text-xs text-gray-400 block">輸入加入時的 Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-brand-400"
            />
            {loginError && <p className="text-xs text-red-500">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {loginLoading ? '寄送中...' : '寄送驗證碼'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeLogin} className="space-y-2">
            <label className="text-xs text-gray-400 block">驗證碼已寄到 {loginEmail}</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={loginCode}
              onChange={e => setLoginCode(e.target.value.replace(/\D/g, ''))}
              placeholder="6 位數驗證碼"
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 tracking-widest text-center focus:outline-none focus:border-brand-400"
            />
            {loginError && <p className="text-xs text-red-500">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading || loginCode.length !== 6}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {loginLoading ? '驗證中...' : '登入'}
            </button>
            <button
              type="button"
              onClick={() => { setLoginStep('email'); setLoginCode(''); setLoginError('') }}
              className="w-full text-xs text-gray-400 hover:text-gray-500 py-1"
            >
              重新輸入 Email
            </button>
          </form>
        )}
        <button
          onClick={() => { setLoginStep('idle'); setLoginEmail(''); setLoginCode(''); setLoginError('') }}
          className="w-full text-xs text-gray-300 hover:text-gray-400 py-1"
        >
          取消
        </button>
      </div>
    )
  }

  if (memberOnly && session.user.memberType !== '資深里民') {
    return (
      <div className="w-full text-center bg-amber-500/20 border border-amber-400/40 text-amber-200 font-semibold py-4 rounded-2xl text-sm">
        此活動限資深里民報名
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="w-full text-center bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-bold py-4 rounded-2xl text-base">
        報名完成！等待確認付款
      </div>
    )
  }

  if (state === 'duplicate') {
    return (
      <div className="w-full text-center bg-white/10 text-white/60 font-semibold py-4 rounded-2xl text-sm">
        你已報名此活動
      </div>
    )
  }

  const handleConfirmPayment = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, eventName, eventDate, paymentNote: `${paymentMethod === 'bank' ? '銀行後5碼' : 'LINE Pay'}：${paymentNote}` }),
      })
      const data = await res.json()
      if (!res.ok) {
        setHasError(true)
      } else {
        setState(data.duplicate ? 'duplicate' : 'success')
      }
    } catch {
      setHasError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (state === 'confirm') {
    const canSubmit = paymentNote.trim().length > 0

    return (
      <div className="bg-white rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="text-brand-800 font-black text-base">確認報名：{eventName}</h3>
        <p className="text-sm text-gray-500">請完成付款後輸入付款資訊。</p>

        {/* 匯款指示 */}
        <PaymentInstructions theme="light" />

        {/* 付款方式切換 */}
        <div className="flex rounded-xl overflow-hidden border border-brand-100">
          <button
            onClick={() => { setPaymentMethod('bank'); setPaymentNote('') }}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${paymentMethod === 'bank' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            銀行轉帳
          </button>
          <button
            onClick={() => { setPaymentMethod('linepay'); setPaymentNote('') }}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${paymentMethod === 'linepay' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            LINE Pay
          </button>
        </div>

        {/* 輸入框 */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            {paymentMethod === 'bank' ? '銀行帳號後 5 碼' : '你的 LINE Pay ID'}
          </label>
          <input
            type={paymentMethod === 'bank' ? 'number' : 'text'}
            value={paymentNote}
            onChange={e => setPaymentNote(e.target.value)}
            placeholder={paymentMethod === 'bank' ? '例：12345' : '例：@yourlineid'}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm focus:outline-none focus:border-brand-400"
          />
        </div>

        <p className="text-xs text-gray-400">
          以 {session.user.email} 報名
        </p>

        <div className="space-y-2">
          <button
            onClick={handleConfirmPayment}
            disabled={submitting || !canSubmit}
            className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors text-sm disabled:opacity-40"
          >
            {submitting ? '送出中...' : '我已完成匯款'}
          </button>
          <button
            onClick={() => { setState('idle'); setPaymentNote('') }}
            className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
          >
            取消
          </button>
        </div>
        {hasError && (
          <p className="text-center text-xs text-red-500">報名失敗，請稍後再試</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setState('confirm')}
        className="block w-full text-center bg-white text-brand-800 font-bold py-4 rounded-2xl hover:bg-brand-50 transition-colors shadow-lg text-base"
      >
        立即報名
      </button>
      <p className="text-center text-xs text-white/40">
        以 {session.user.email} 報名
      </p>
    </div>
  )
}
