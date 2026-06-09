import { getEvents } from '@/lib/notion'
import EventCard from '@/components/EventCard'

export const revalidate = 60

export default async function EventsPage() {
  const events = await getEvents()

  const active = events.filter(e => e.status !== '已結束')
  const ended = events.filter(e => e.status === '已結束')

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-brand-800 mb-1">所有活動</h1>
      <p className="text-brand-400 mb-10">每月 10–15 場，總有一場適合你</p>

      {active.length > 0 && (
        <section className="mb-14">
          <h2 className="text-lg font-bold text-brand-700 mb-5 border-l-4 border-brand-500 pl-3">開放報名</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {active.map(event => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        </section>
      )}

      {ended.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-brand-300 mb-5 border-l-4 border-brand-100 pl-3">已結束活動</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
            {ended.map(event => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <p className="text-brand-400 text-center py-20 bg-white/60 rounded-2xl">目前尚無活動，請稍後再來。</p>
      )}
    </div>
  )
}
