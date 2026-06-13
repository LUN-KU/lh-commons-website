'use client'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function LoginButton() {
  const { data: session, status } = useSession()
  const [showOptions, setShowOptions] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailLoading(true)
    const res = await signIn('email-login', { email, redirect: false })
    setEmailLoading(false)
    if (res?.error) {
      setEmailError('找不到此 Email，請確認是否已加入領航里')
    } else {
      setShowOptions(false)
      setShowEmailForm(false)
    }
  }

  if (showOptions) {
    return (
      <div className="relative">
        <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-2xl p-4 w-64 z-50 space-y-2">
          <p className="text-xs text-gray-400 mb-3">選擇登入方式</p>
          <button
            onClick={() => signIn('google')}
            className="w-full flex items-center gap-2 bg-brand-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-brand-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google 帳號登入
          </button>
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
            >
              沒有 Google 帳號？用 Email 登入
            </button>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-2 pt-1">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="輸入你的 Email"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-brand-400"
              />
              {emailError && <p className="text-xs text-red-500">{emailError}</p>}
              <button
                type="submit"
                disabled={emailLoading}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {emailLoading ? '驗證中...' : '確認登入'}
              </button>
            </form>
          )}
          <button
            onClick={() => { setShowOptions(false); setShowEmailForm(false); setEmailError('') }}
            className="w-full text-xs text-gray-300 hover:text-gray-400 py-1"
          >
            取消
          </button>
        </div>
        <button
          onClick={() => setShowOptions(false)}
          className="text-sm font-medium text-white bg-white/15 hover:bg-white/25 px-4 py-1.5 rounded-full transition-colors"
        >
          里民登入
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowOptions(true)}
      className="text-sm font-medium text-white bg-white/15 hover:bg-white/25 px-4 py-1.5 rounded-full transition-colors"
    >
      里民登入
    </button>
  )
}
