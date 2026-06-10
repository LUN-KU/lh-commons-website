import { getEvents } from '@/lib/notion'
import EventsGrid from '@/components/EventsGrid'

export const revalidate = 60

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-white mb-1">活動探索</h1>
      <p className="text-white/50 mb-8">每月 10–15 場，總有一場適合你</p>
      <EventsGrid events={events} />
    </div>
  )
}
