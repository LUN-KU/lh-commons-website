import Link from 'next/link'
import { getEvents, getHomePageBlocks, getActivityFeaturedImage } from '@/lib/notion'
import EventCard from '@/components/EventCard'
import PhotoCarousel from '@/components/PhotoCarousel'
import NotionBlocks from '@/components/NotionBlocks'

export const revalidate = 60

const SERVICES = [
  { icon: '🎯', label: '目標設定陪跑' },
  { icon: '👥', label: '社群人際拓展' },
  { icon: '📚', label: '成長學習計劃' },
  { icon: '💡', label: '生活品質提升' },
  { icon: '🤝', label: '里民資源媒合' },
]

export default async function Home() {
  const [allEvents, homeBlocks, featuredImage] = await Promise.all([
    getEvents(),
    getHomePageBlocks(),
    getActivityFeaturedImage(),
  ])
  const upcoming = allEvents.filter(e => e.status === '報名中').slice(0, 3)

  const headingBlock = homeBlocks.find(b => ['heading_1', 'heading_2', 'heading_3'].includes(b.type))
  const sectionTitle = headingBlock
    ? (headingBlock[headingBlock.type]?.rich_text ?? []).map((t: any) => t.plain_text).join('')
    : '讓 Learn 成為你的 hobby'
  const bodyBlocks = homeBlocks.filter(b => b !== headingBlock)

  return (
    <div>

      {/* ── Section 2: 活動介紹 ── */}
      <section className="bg-white/5 border-y border-white/10 py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* Left: text */}
          <div>
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-5">Activities</p>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-5">{sectionTitle}</h2>
            <div className="w-14 h-0.5 bg-white/30 mb-6" />
            {bodyBlocks.length > 0 ? (
              <NotionBlocks blocks={bodyBlocks} dark />
            ) : (
              <p className="text-white/50 text-sm leading-relaxed">
                想要結交一同熱愛學習生活的朋友，那就來參加領航里民活動，從讀書會、打羽球、劇本殺、密室逃脫、繪畫課等等各式各樣活動等待你一同加入。
              </p>
            )}
            <Link
              href="/events"
              className="mt-8 inline-block border border-white/30 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-white/10 transition-colors"
            >
              查看所有活動 →
            </Link>
          </div>

          {/* Right: quote + photo */}
          <div>
            <p className="text-white/55 text-sm mb-4 pl-3 border-l-2 border-white/30 leading-relaxed">
              不只是社交，還有派對、運動、講座，等待里民們加入
            </p>
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
            <PhotoCarousel />
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
