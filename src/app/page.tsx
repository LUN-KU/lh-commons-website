import Link from 'next/link'
import Image from 'next/image'
import { getEvents } from '@/lib/notion'
import EventCard from '@/components/EventCard'
import EventCalendar from '@/components/EventCalendar'

export const revalidate = 60

export default async function Home() {
  const allEvents = await getEvents()
  const upcoming = allEvents.filter(e => e.status === '報名中').slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="py-24 px-6 text-center">
        <div className="inline-block mb-6">
          <Image src="/logo.png" alt="領航里" width={90} height={90} />
        </div>
        <p className="text-brand-400 text-sm tracking-widest mb-2 uppercase">Welcome to</p>
        <h1 className="text-5xl font-black text-brand-700 mb-4 tracking-wide">領航里</h1>
        <p className="text-brand-500 text-lg mb-2">深度交流 × 有效社交 × 打造理想生活圈</p>
        <p className="text-brand-400 text-sm mb-10">700+ 里民・每月 10-15 場活動</p>
        <Link
          href="/events"
          className="inline-block bg-brand-700 text-white font-bold px-10 py-3.5 rounded-full hover:bg-brand-800 transition-colors shadow-lg"
        >
          查看所有活動
        </Link>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-brand-700">近期活動</h2>
          <Link href="/events" className="text-sm text-brand-400 hover:text-brand-600 transition-colors">
            查看全部 →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-brand-300 text-center py-12">目前沒有開放報名的活動，請稍後再來。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Calendar */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-700">活動月曆</h2>
          <Link href="/events" className="text-sm text-brand-400 hover:text-brand-600 transition-colors">
            查看全部 →
          </Link>
        </div>
        <EventCalendar events={allEvents} />
      </section>

      {/* About strip */}
      <section className="bg-brand-700 py-16 px-6 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">關於領航里</h2>
        <p className="text-brand-200 max-w-xl mx-auto mb-6">
          領航里是一個溫暖的實體社群，我們相信透過真實的連結與深度的交流，每個人都能找到屬於自己的理想生活圈。
        </p>
        <Link
          href="/about"
          className="inline-block border border-white text-white font-medium px-6 py-2.5 rounded-full hover:bg-white hover:text-brand-700 transition-colors"
        >
          了解更多
        </Link>
      </section>
    </div>
  )
}
