import Link from 'next/link'
import { getEvents, getSiteSettings } from '@/lib/notion'
import EventCard from '@/components/EventCard'
import PhotoCarousel from '@/components/PhotoCarousel'

export const revalidate = 60

const SERVICES = [
  { icon: '🎯', label: '目標設定陪跑' },
  { icon: '👥', label: '社群人際拓展' },
  { icon: '📚', label: '成長學習計劃' },
  { icon: '💡', label: '生活品質提升' },
  { icon: '🤝', label: '里民資源媒合' },
]

export default async function Home() {
  const [allEvents, settings] = await Promise.all([getEvents(), getSiteSettings()])
  const upcoming = allEvents.filter(e => e.status === '報名中').slice(0, 3)

  // 取有封面圖的活動，最多 6 張給 carousel
  const carouselImages = allEvents
    .filter(e => e.coverImage || e.iconImage)
    .map(e => (e.coverImage || e.iconImage) as string)
    .slice(0, 6)

  // 活動介紹區：取第一張有封面圖的活動圖
  const featuredImage = carouselImages[0] ?? null

  return (
    <div>

      {/* ── Section 1: Intro ── */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-14">
        <p className="text-white/65 text-base leading-relaxed max-w-3xl mb-16">
          {settings.about || '領航里致力於帶領大家共同成長，透過舉辦多元化的同樂活動，促進彼此的交流與合作。我們相信，在這裡，成長不僅是個人的，更是大家攜手並進的旅程，讓每個人成為更好的自己。'}
        </p>

        {/* Large display text */}
        <div className="border-t border-white/10 pt-10 mb-12 overflow-hidden">
          <p className="text-[clamp(2.8rem,9vw,7.5rem)] font-black text-white/8 tracking-[0.12em] leading-none select-none whitespace-nowrap">
            LIBERTY HOPEFUL
          </p>
        </div>

        {/* Tagline 2-col */}
        <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-16 items-start">
          <div className="hidden md:block pt-2">
            <div className="w-16 h-px bg-white/30" />
          </div>
          <div>
            <p className="text-white font-bold text-lg mb-3">領航里里民｜交流、學習、社交</p>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg">
              {settings.joinUs || '這裡是一個交流學習的平台，我們會舉辦各種活動包含學習讀書會、同樂桌遊、繪畫手作課程、烘焙料理、劇本殺密室等等，希望大家能在這裡找到可以一起前進成長的同伴。'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 2: 活動介紹 ── */}
      <section className="bg-white/5 border-y border-white/10 py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* Left: text */}
          <div>
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-5">Activities</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">領航里民活動</h2>
            <div className="w-14 h-0.5 bg-white/30 mb-6" />
            <p className="text-white/70 font-semibold mb-4 text-[15px]">讓 Learn 成為你的 hobby</p>
            <p className="text-white/50 text-sm leading-relaxed">
              想要結交一同熱愛學習生活的朋友，那就來參加領航里民活動，從讀書會、打羽球、劇本殺、密室逃脫、繪畫課等等各式各樣活動等待你一同加入。
            </p>
            <Link
              href="/events"
              className="mt-8 inline-block border border-white/30 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-white/10 transition-colors"
            >
              查看所有活動 →
            </Link>
          </div>

          {/* Right: photo */}
          <div>
            {featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featuredImage}
                alt="領航里活動"
                className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-white/10 rounded-2xl flex items-center justify-center text-white/20 text-6xl">
                🎉
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 3: 近期活動 ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-2">Upcoming</p>
            <h2 className="text-3xl font-black text-white">近期活動</h2>
          </div>
          <Link
            href="/events"
            className="text-sm font-medium text-white/60 hover:text-white border border-white/20 px-4 py-1.5 rounded-full hover:border-white/50 transition-colors"
          >
            查看全部 →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-white/40 text-center py-12 bg-white/10 rounded-2xl">目前沒有開放報名的活動，請稍後再來。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        )}
      </section>

      {/* ── Section 4: 活動紀錄 ── */}
      <section className="bg-white/5 border-y border-white/10 py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-start">

          {/* Left: text */}
          <div>
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-5">Event Record</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">活動紀錄</h2>
            <div className="w-14 h-0.5 bg-white/30 mb-6" />
            <p className="text-white/70 font-semibold mb-4 text-[15px]">每一次活動，都是一段珍貴的記憶</p>
            <p className="text-white/50 text-sm leading-relaxed">
              領航里每月舉辦多場活動，從文化講座到戶外運動，每一場都有里民們歡聚的珍貴瞬間。這些紀錄代表著我們一起走過的每一步。
            </p>
          </div>

          {/* Right: carousel */}
          <div>
            <PhotoCarousel images={carouselImages} />
          </div>
        </div>
      </section>

      {/* ── Section 5: 里民諮詢服務 ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-white/40 text-xs tracking-[0.25em] uppercase mb-4">Community Service</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">里民諮詢服務</h2>
          <div className="w-14 h-0.5 bg-white/30 mx-auto mb-6" />
          <p className="text-white/55 max-w-xl mx-auto text-sm leading-relaxed mb-12">
            無論是生活規劃、成長陪跑、社交破冰，里民顧問都在這裡陪你一起走，讓每一步都更有方向
          </p>

          <div className="bg-white/8 border border-white/15 rounded-3xl p-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6 text-left items-center">
              {SERVICES.map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-2xl flex-none">{s.icon}</span>
                  <span className="text-white font-medium text-sm">{s.label}</span>
                </div>
              ))}
              <div className="flex items-center justify-center col-span-2 md:col-span-1">
                <Link
                  href="/about"
                  className="bg-white/20 hover:bg-white/30 text-white font-bold px-7 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
                >
                  點我了解更多
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
