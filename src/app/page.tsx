import Link from 'next/link'
import Image from 'next/image'
import { getEvents, getSiteSettings } from '@/lib/notion'
import EventCard from '@/components/EventCard'
import EventCalendar from '@/components/EventCalendar'

export const revalidate = 60

export default async function Home() {
  const [allEvents, settings] = await Promise.all([getEvents(), getSiteSettings()])
  const upcoming = allEvents.filter(e => e.status === '報名中').slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 relative">
          <div className="flex flex-col md:flex-row md:items-center md:gap-10">

            {/* Left: text */}
            <div className="md:flex-1">
              <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-white/70 inline-block" />
                每月 10–15 場活動，歡迎加入
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-5">
                找到屬於你的<br />
                <span className="text-brand-300">理想生活圈</span>
              </h1>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                深度交流 × 有效社交 × 真實連結<br />
                領航里，{settings.memberCount} 里民的溫暖社群
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="bg-white text-brand-800 font-bold px-8 py-3.5 rounded-full hover:bg-brand-100 transition-colors shadow-lg"
                >
                  查看近期活動
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-white/40 text-white font-bold px-8 py-3.5 rounded-full hover:border-white/70 hover:bg-white/10 transition-colors"
                >
                  了解更多
                </Link>
              </div>
            </div>

            {/* Right: logo + floating tags */}
            <div className="hidden md:flex md:flex-none md:w-72 items-center justify-center relative h-64 mt-8 md:mt-0">
              <div className="w-48 h-48 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-sm">
                <Image src="/logo.png" alt="領航里" width={100} height={100} />
              </div>
              <div className="absolute top-2 right-0 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2 text-sm font-medium text-white">
                🎭 主題交流
              </div>
              <div className="absolute bottom-4 left-0 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2 text-sm font-medium text-white">
                🏃 運動揪團
              </div>
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 bg-brand-500/80 backdrop-blur-sm rounded-2xl px-4 py-2 text-sm font-medium text-white">
                📚 讀書會
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 text-center">
            <p className="text-4xl font-black text-white">{settings.memberCount}</p>
            <p className="text-sm text-white/50 mt-1.5">里民人數</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 text-center">
            <p className="text-4xl font-black text-white">{settings.eventsPerMonth}</p>
            <p className="text-sm text-white/50 mt-1.5">每月活動場數</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 text-center">
            <p className="text-4xl font-black text-white">9+</p>
            <p className="text-sm text-white/50 mt-1.5">活動類型</p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">近期活動</h2>
            <p className="text-sm text-white/50 mt-0.5">目前開放報名</p>
          </div>
          <Link href="/events" className="text-sm font-medium text-white/70 hover:text-white transition-colors border border-white/20 px-4 py-1.5 rounded-full hover:border-white/50">
            查看全部 →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-white/40 text-center py-12 bg-white/10 rounded-2xl">目前沒有開放報名的活動，請稍後再來。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        )}
      </section>

      {/* Calendar */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">活動月曆</h2>
            <p className="text-sm text-white/50 mt-0.5">點選日期查看當天活動</p>
          </div>
          <Link href="/events" className="text-sm font-medium text-white/70 hover:text-white transition-colors border border-white/20 px-4 py-1.5 rounded-full hover:border-white/50">
            查看全部 →
          </Link>
        </div>
        <EventCalendar events={allEvents} />
      </section>

      {/* About strip */}
      <section className="bg-white/10 border-t border-white/10 py-16 px-6 text-center text-white">
        <p className="text-white/40 text-sm mb-3 tracking-widest uppercase">About Us</p>
        <h2 className="text-3xl font-black mb-4 tracking-wide">關於領航里</h2>
        <p className="text-white/60 max-w-lg mx-auto mb-8 leading-relaxed">
          我們相信透過真實的連結與深度的交流，每個人都能找到屬於自己的理想生活圈。
        </p>
        <Link
          href="/about"
          className="inline-block border-2 border-white/40 text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-brand-800 transition-colors"
        >
          了解更多
        </Link>
      </section>
    </div>
  )
}
