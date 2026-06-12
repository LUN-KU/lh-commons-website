import { getEvents } from '@/lib/notion'
import EventsGrid from '@/components/EventsGrid'
import EventCalendar from '@/components/EventCalendar'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const [events, session] = await Promise.all([getEvents(), getServerSession(authOptions)])
  const memberType = session?.user?.memberType
  const visibleEvents = events.filter(e => !e.memberOnly || memberType === '資深里民')

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-white mb-1">活動行事曆＆報名</h1>
      <p className="text-white/50 mb-10">每月 10–15 場，總有一場適合你</p>

      {/* 月曆 */}
      <div className="mb-12">
        <EventCalendar events={visibleEvents} />
      </div>

      {/* 活動列表 */}
      <h2 className="text-xl font-black text-white mb-6">所有活動</h2>
      <EventsGrid events={visibleEvents} />
    </div>
  )
}
