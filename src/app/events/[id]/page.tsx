import { getEvent, getEvents, getEventBlocks } from '@/lib/notion'
import NotionBlocks from '@/components/NotionBlocks'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export async function generateStaticParams() {
  const events = await getEvents()
  return events.map(e => ({ id: e.id }))
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日（${weekdays[d.getDay()]}）`
}

const statusBadge: Record<string, string> = {
  '報名中': 'bg-emerald-500 text-white',
  '額滿':   'bg-orange-400 text-white',
  '已結束': 'bg-white/20 text-white/60',
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, blocks] = await Promise.all([
    getEvent(params.id),
    getEventBlocks(params.id),
  ])
  if (!event) notFound()

  const badge = statusBadge[event.status] ?? 'bg-white/20 text-white/60'
  const displayImage = event.coverImage || event.iconImage
  const hasFeeCards = event.regularFee || event.memberFee || event.earlyFee

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back */}
      <Link href="/events" className="text-sm text-white/50 hover:text-white mb-6 inline-flex items-center gap-1 transition-colors">
        ← 回到活動列表
      </Link>

      <div className="md:flex md:gap-8 md:items-start mt-4">

        {/* ── LEFT: sticky panel ── */}
        <div className="md:w-[360px] md:flex-none md:sticky md:top-24 space-y-4 mb-8 md:mb-0">

          {/* Poster */}
          <div className="rounded-3xl overflow-hidden shadow-xl">
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt={event.name}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="aspect-square bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-white/20 text-6xl">
                🎉
              </div>
            )}
          </div>

          {/* Basic info card */}
          <div className="bg-white rounded-2xl p-5 space-y-3">
            {event.date && (
              <div className="flex gap-3 items-start text-brand-600">
                <span className="flex-none w-5 text-center">📅</span>
                <span className="text-sm leading-relaxed">
                  {formatDate(event.date)}
                  {event.time && <><br /><span className="text-brand-400">{event.time}</span></>}
                </span>
              </div>
            )}
            {event.location && (
              <div className="flex gap-3 items-start text-brand-600">
                <span className="flex-none w-5 text-center">📍</span>
                <span className="text-sm">{event.location}</span>
              </div>
            )}
          </div>

          {/* CTA button */}
          {event.registrationUrl && event.status === '報名中' ? (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-white text-brand-800 font-bold py-4 rounded-2xl hover:bg-brand-50 transition-colors shadow-lg text-base"
            >
              立即報名
            </a>
          ) : event.status === '額滿' ? (
            <div className="w-full text-center bg-white/20 text-white/50 font-bold py-4 rounded-2xl text-base">
              已額滿
            </div>
          ) : event.status === '已結束' ? (
            <div className="w-full text-center bg-white/10 text-white/30 font-bold py-4 rounded-2xl text-base">
              活動已結束
            </div>
          ) : null}

          <p className="text-center text-xs text-white/30">
            報名問題請私訊 IG{' '}
            <a href="https://www.instagram.com/l.h_commons" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60 transition-colors">
              @l.h_commons
            </a>
          </p>
        </div>

        {/* ── RIGHT: scrollable content ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Category + Status */}
          <div className="flex items-center gap-2 flex-wrap">
            {event.category && (
              <span className="bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full">
                {event.category}
              </span>
            )}
            {event.status && (
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${badge}`}>
                {event.status}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
            {event.name}
          </h1>

          {/* Fee section */}
          {hasFeeCards ? (
            <div className={`grid gap-3 ${[event.earlyFee, event.memberFee, event.regularFee].filter(Boolean).length === 1 ? 'grid-cols-1' : [event.earlyFee, event.memberFee, event.regularFee].filter(Boolean).length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {event.earlyFee && (
                <div className="bg-white rounded-2xl p-4 text-center border-2 border-amber-100">
                  <p className="text-xs text-amber-500 mb-2 font-semibold tracking-wide">早鳥里民</p>
                  <p className="text-xl font-black text-brand-700">{event.earlyFee}</p>
                </div>
              )}
              {event.memberFee && (
                <div className="bg-white rounded-2xl p-4 text-center border-2 border-brand-100">
                  <p className="text-xs text-brand-500 mb-2 font-semibold tracking-wide">資深里民</p>
                  <p className="text-xl font-black text-brand-700">{event.memberFee}</p>
                </div>
              )}
              {event.regularFee && (
                <div className="bg-white rounded-2xl p-4 text-center border-2 border-brand-50">
                  <p className="text-xs text-brand-400 mb-2 font-semibold tracking-wide">一般里民</p>
                  <p className="text-xl font-black text-brand-700">{event.regularFee}</p>
                </div>
              )}
            </div>
          ) : event.fee ? (
            <div className="bg-white rounded-2xl p-5 text-center border-2 border-brand-50">
              <p className="text-xs text-brand-400 mb-2 font-semibold tracking-wide">費用</p>
              <p className="text-xl font-black text-brand-700">{event.fee}</p>
            </div>
          ) : null}

          {/* Notion content blocks */}
          {blocks.length > 0 && (
            <div className="bg-white rounded-3xl p-7 shadow-sm">
              <NotionBlocks blocks={blocks} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
