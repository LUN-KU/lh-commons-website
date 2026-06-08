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
      <section className="pt-20 pb-16 px-6 text-center">
        <div className="inline-block mb-5">
          <Image src="/logo.png" alt="領航里" width={80} height={80} />
        </div>
        <h1 className="text-5xl font-black text-brand-700 mb-3 tracking-widest">領航里</h1>
        <p className="text-brand-500 text-base mb-1 tracking-wider">深度交流 × 有效社交 × 打造理想生活圈</p>
        <p className="text-brand-300 text-sm mb-10 tracking-wide">— 領航里里民活動 —</p>
        <Link
          href="/events"
          className="inline-block bg-brand-700 text-white font-bold px-10 py-3.5 rounded-full hover:bg-brand-800 transition-colors"
        >
          查看所有活動
        </Link>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-brand-700 tracking-wide">近期活動</h2>
          <Link href="/events" className="text-sm text-brand-400 hover:text-brand-600 transition-colors">
            查看全部 →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-brand-300 text-center py-12">目前沒有開放報名的活動，請稍後再來。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Calendar */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-brand-700 tracking-wide">活動月曆</h2>
          <Link href="/events" className="text-sm text-brand-400 hover:text-brand-600 transition-colors">
            查看全部 →
          </Link>
        </div>
        <EventCalendar events={allEvents} />
      </section>

      {/* About strip */}
      <section className="bg-brand-700 py-16 px-6 text-center text-white">
        <h2 className="text-2xl font-bold mb-3 tracking-wide">關於領航里</h2>
        <p className="text-brand-200 max-w-xl mx-auto mb-8 leading-relaxed">
          領航里是一個溫暖的實體社群，我們相信透過真實的連結與深度的交流，每個人都能找到屬於自己的理想生活圈。
        </p>
        <Link
          href="/about"
          className="inline-block border border-white/60 text-white font-medium px-8 py-3 rounded-full hover:bg-white hover:text-brand-700 transition-colors"
        >
          了解更多
        </Link>
      </section>
    </div>
  )
}
