import { getEvents } from '@/lib/notion'
import EventsPageClient from '@/components/EventsPageClient'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const [events, session] = await Promise.all([getEvents(), getServerSession(authOptions)])
  const memberType = session?.user?.memberType
  const visibleEvents = events.filter(e => !e.memberOnly || memberType === '資深里民')

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-white mb-1">活動行事曆＆報名</h1>
      <p className="text-white/50 mb-6">每月精彩活動，打造理想生活圈</p>

      {/* 加入里民入口 */}
      {!session && (
        <div className="flex gap-3 mb-10">
          <Link href="/join"
            className="flex-1 text-center bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold py-3 rounded-2xl text-sm transition-colors"
          >
            我要成為里民
          </Link>
          <Link href="/join?type=senior"
            className="flex-1 text-center bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-100 font-semibold py-3 rounded-2xl text-sm transition-colors"
          >
            ⭐ 我要成為資深里民
          </Link>
        </div>
      )}

      <EventsPageClient events={visibleEvents} />
    </div>
  )
}
