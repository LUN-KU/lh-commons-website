'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function LoginButton() {
  const { data: session, status } = useSession()

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

  return (
    <button
      onClick={() => signIn('google')}
      className="text-sm font-medium text-white bg-white/15 hover:bg-white/25 px-4 py-1.5 rounded-full transition-colors"
    >
      里民登入
    </button>
  )
}
