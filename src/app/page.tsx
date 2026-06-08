import Link from 'next/link'
import { getEvents } from '@/lib/notion'
import EventCard from '@/components/EventCard'

export const revalidate = 60

export default async function Home() {
  const allEvents = await getEvents()
  const upcoming = allEvents.filter(e => e.status === '報名中').slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <section className="bg-warm-700 text-white py-24 px-6 text-center">
        <p className="text-warm-200 text-sm tracking-widest mb-3 uppercase">Welcome to</p>
        <h1 className="text-5xl font-bold mb-4 tracking-wide">領航里</h1>
        <p className="text-warm-200 text-lg mb-2">深度交流 × 有效社交 × 打造理想生活圈</p>
        <p className="text-warm-300 text-sm mb-8">700+ 里民・每月 10-15 場活動</p>
        <Link
          href="/events"
          className="inline-block bg-white text-warm-700 font-bold px-8 py-3 rounded-full hover:bg-warm-50 transition-colors"
        >
          查看所有活動
        </Link>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-warm-800">近期活動</h2>
          <Link href="/events" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">
            查看全部 →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-warm-400 text-center py-12">目前沒有開放報名的活動，請稍後再來。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* About strip */}
      <section className="bg-warm-100 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-warm-800 mb-3">關於領航里</h2>
        <p className="text-warm-600 max-w-xl mx-auto mb-6">
          領航里是一個溫暖的實體社群，我們相信透過真實的連結與深度的交流，每個人都能找到屬於自己的理想生活圈。
        </p>
        <Link
          href="/about"
          className="inline-block border border-warm-600 text-warm-700 font-medium px-6 py-2.5 rounded-full hover:bg-warm-600 hover:text-white transition-colors"
        >
          了解更多
        </Link>
      </section>
    </div>
  )
}
