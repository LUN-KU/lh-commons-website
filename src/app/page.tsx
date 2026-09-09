import Link from 'next/link'
import { getEvents, getHomePageBlocks, getActivityFeaturedImage } from '@/lib/notion'
import EventCard from '@/components/EventCard'
import PhotoCarousel from '@/components/PhotoCarousel'
import NotionBlocks from '@/components/NotionBlocks'

export const dynamic = 'force-dynamic'

const SERVICES = [
  {
    label: '目標設定陪跑',
    icon: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /></>),
  },
  {
    label: '社群人際拓展',
    icon: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  },
  {
    label: '成長學習計劃',
    icon: (<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>),
  },
  {
    label: '生活品質提升',
    icon: (<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />),
  },
  {
    label: '里民資源媒合',
    icon: (<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>),
  },
]

export default async function Home() {
  const [allEvents, homeBlocks, featuredImage] = await Promise.all([
    getEvents(),
    getHomePageBlocks(),
    getActivityFeaturedImage(),
  ])
  const upcoming = allEvents.filter(e => e.status === '報名中').slice(0, 3)

  const bodyBlocks = homeBlocks.filter(b => {
    if (['heading_1', 'heading_2', 'heading_3'].includes(b.type)) return false
    if (b.type === 'paragraph') {
      const text = (b.paragraph?.rich_text ?? []).map((t: any) => t.plain_text).join('')
      if (text.startsWith('# ')) return false
    }
    return true
  })

  return (
    <div>

      {/* ── Section 2: 活動介紹 ── */}
      <section className="bg-white/5 border-y border-white/10 py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* Left: text */}
          <div>
            {bodyBlocks.length > 0 ? (
              <NotionBlocks blocks={bodyBlocks} dark />
            ) : (
              <p className="text-white/65 text-sm leading-relaxed">
                想要結交一同熱愛學習生活的朋友，那就來參加領航里民活動，從讀書會、打羽球、劇本殺、密室逃脫、繪畫課等等各式各樣活動等待你一同加入。
              </p>
            )}
            <Link
              href="/links"
              className="group mt-8 inline-flex items-center gap-2 bg-white text-brand-700 text-[15px] font-bold px-7 py-3 rounded-full shadow-lg shadow-brand-900/25 hover:shadow-xl hover:shadow-brand-900/35 hover:-translate-y-0.5 transition-all duration-200"
            >
              一鍵入籍領航里
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Right: quote + photo */}
          <div>
            <p className="text-white font-medium text-base mb-4 pl-4 border-l-[3px] border-white/50 leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.28)]">
              陪你嘗試未曾體驗的日常，在笑聲與深度交流中，活出你最喜歡的模樣
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
            <p className="text-amber-200/70 text-xs tracking-[0.2em] uppercase mb-2">Upcoming</p>
            <h2 className="text-3xl font-black text-white">近期活動</h2>
          </div>
          <Link
            href="/events"
            className="group flex-none inline-flex items-center gap-1.5 text-sm font-bold text-white bg-white/15 hover:bg-white/25 border-2 border-white/50 hover:border-white/80 px-5 py-2 rounded-full transition-colors"
          >
            查看全部
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-white/60 text-center py-12 bg-white/10 rounded-2xl">目前沒有開放報名的活動，請稍後再來。</p>
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
            <p className="text-amber-200/70 text-xs tracking-[0.2em] uppercase mb-5">Life With Us</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">共創時刻</h2>
            <div className="w-14 h-0.5 bg-white/30 mb-6" />
            <p className="text-white/70 font-semibold mb-4 text-[15px]">在台北最多元的活動社群，感受最真誠的實體連結</p>
            <p className="text-white/65 text-sm leading-relaxed">
              放下手機、走入人群，領航里這個充滿人情味的社群，讓你在實體互動中真誠相遇。我們透過豐富多元的活動，陪你一起嘗試未曾體驗的日常，更能找到一群頻率相同、願意陪你探索世界的夥伴。
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
          <p className="text-amber-200/70 text-xs tracking-[0.25em] uppercase mb-4">Community Service</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">里民諮詢服務</h2>
          <div className="w-14 h-0.5 bg-amber-200/50 mx-auto mb-6" />
          <p className="text-white/75 max-w-xl mx-auto text-sm leading-relaxed mb-12">
            無論是生活規劃、成長陪跑、社交破冰，里民顧問都在這裡陪你一起走，讓每一步都更有方向
          </p>

          <div className="bg-white/[0.07] border border-white/15 rounded-3xl p-8 md:p-10 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6 text-left">
              {SERVICES.map(s => (
                <div key={s.label} className="flex items-center gap-3.5">
                  <span className="flex-none w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-amber-100">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      {s.icon}
                    </svg>
                  </span>
                  <span className="text-white font-medium text-sm whitespace-nowrap">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-9">
              <Link
                href="/about"
                className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                點我了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
