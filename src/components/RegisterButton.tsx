'use client'
import { useSession, signIn } from 'next-auth/react'
import { useState } from 'react'

type Props = {
  eventId: string
  eventName: string
  eventStatus: string
  memberOnly: boolean
}

export default function RegisterButton({ eventId, eventName, eventStatus, memberOnly }: Props) {
  const { data: session, status } = useSession()
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')

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
    return (
      <div className="w-full h-14 bg-white/10 rounded-2xl animate-pulse" />
    )
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="block w-full text-center bg-white text-brand-800 font-bold py-4 rounded-2xl hover:bg-brand-50 transition-colors shadow-lg text-base"
      >
        登入後報名
      </button>
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
        報名成功！
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

  const handleRegister = async () => {
    setState('loading')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, eventName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setState('error')
      } else {
        setState(data.duplicate ? 'duplicate' : 'success')
      }
    } catch {
      setState('error')
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleRegister}
        disabled={state === 'loading'}
        className="block w-full text-center bg-white text-brand-800 font-bold py-4 rounded-2xl hover:bg-brand-50 transition-colors shadow-lg text-base disabled:opacity-60"
      >
        {state === 'loading' ? '報名中...' : '立即報名'}
      </button>
      {state === 'error' && (
        <p className="text-center text-xs text-red-300">報名失敗，請稍後再試</p>
      )}
      <p className="text-center text-xs text-white/40">
        以 {session.user.email} 報名
      </p>
    </div>
  )
}
