'use client'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function LoginButton() {
  const { data: session, status } = useSession()
  const [showForm, setShowForm] = useState(false)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  if (status === 'loading') {
    return <div className="w-16 h-7 bg-white/10 rounded-full animate-pulse" />
  }

  if (session?.user) {
    const isSenior = session.user.memberType === '資深里民'
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/60 hidden sm:block">
          {isSenior ? '⭐ 資深里民' : '里民'}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm text-white/60 hover:text-white border border-white/20 px-3 py-1 rounded-full hover:border-white/50 transition-colors"
        >
          登出
        </button>
      </div>
    )
  }

  const closeForm = () => {
    setShowForm(false)
    setStep('email')
    setEmail('')
    setCode('')
    setEmailError('')
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailLoading(true)
    try {
      const res = await fetch('/api/login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStep('code')
      } else if (data.error === 'PENDING') {
        setEmailError('申請審核中，請等待管理員核准後再登入')
      } else if (data.error === 'SERVICE') {
        setEmailError('系統忙碌中，請稍後再試')
      } else {
        setEmailError('找不到此 Email，請確認是否已加入領航里')
      }
    } catch {
      setEmailError('系統忙碌中，請稍後再試')
    }
    setEmailLoading(false)
  }

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailLoading(true)
    const res = await signIn('email-login', { email, code, redirect: false })
    setEmailLoading(false)
    if (res?.error) {
      if (res.error.includes('CODE')) {
        setEmailError('驗證碼錯誤或已過期，請重新輸入')
      } else if (res.error.includes('PENDING')) {
        setEmailError('申請審核中，請等待管理員核准後再登入')
      } else if (res.error.includes('SERVICE')) {
        setEmailError('系統忙碌中，請稍後再試')
      } else {
        setEmailError('找不到此 Email，請確認是否已加入領航里')
      }
    } else {
      closeForm()
    }
  }

  if (showForm) {
    return (
      <div className="relative">
        <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-2xl p-4 w-64 z-50 space-y-2">
          {step === 'email' ? (
            <>
              <p className="text-xs text-gray-400 mb-3">輸入加入時的 Email</p>
              <form onSubmit={handleSendCode} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-brand-400"
                />
                {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  {emailLoading ? '寄送中...' : '寄送驗證碼'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-3">驗證碼已寄到 {email}</p>
              <form onSubmit={handleCodeLogin} className="space-y-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 位數驗證碼"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 tracking-widest text-center focus:outline-none focus:border-brand-400"
                />
                {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                <button
                  type="submit"
                  disabled={emailLoading || code.length !== 6}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  {emailLoading ? '驗證中...' : '登入'}
                </button>
              </form>
              <button
                onClick={() => { setStep('email'); setCode(''); setEmailError('') }}
                className="w-full text-xs text-gray-400 hover:text-gray-500 py-1"
              >
                重新輸入 Email
              </button>
            </>
          )}
          <button
            onClick={closeForm}
            className="w-full text-xs text-gray-300 hover:text-gray-400 py-1"
          >
            取消
          </button>
        </div>
        <button
          onClick={closeForm}
          className="text-sm font-medium text-white bg-white/15 hover:bg-white/25 px-4 py-1.5 rounded-full transition-colors"
        >
          里民登入
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="text-sm font-medium text-white bg-white/15 hover:bg-white/25 px-4 py-1.5 rounded-full transition-colors"
    >
      里民登入
    </button>
  )
}
