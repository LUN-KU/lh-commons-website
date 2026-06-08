import { getEvents } from '@/lib/notion'
import EventCard from '@/components/EventCard'

export const revalidate = 60

const CATEGORIES = ['全部', '主題式交流活動', '興趣培養', '休閒體驗', '讀書會', '運動', '桌遊', '一日遊', '派對', '專業講座']

export default async function EventsPage() {
  const events = await getEvents()

  const active = events.filter(e => e.status !== '已結束')
  const ended = events.filter(e => e.status === '已結束')

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-warm-800 mb-2">所有活動</h1>
      <p className="text-warm-500 mb-10">每月 10-15 場，總有一場適合你</p>

      {active.length > 0 && (
        <section className="mb-14">
          <h2 className="text-lg font-bold text-warm-700 mb-5 border-l-4 border-warm-500 pl-3">開放報名</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {active.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {ended.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-warm-400 mb-5 border-l-4 border-warm-200 pl-3">已結束活動</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
            {ended.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <p className="text-warm-400 text-center py-20">目前尚無活動，請稍後再來。</p>
      )}
    </div>
  )
}
