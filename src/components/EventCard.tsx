import Link from 'next/link'
import type { Event } from '@/lib/notion'

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${month}/${day}（${weekdays[d.getDay()]}）`
}

const statusBadge: Record<string, string> = {
  '報名中': 'bg-emerald-500 text-white',
  '額滿':   'bg-orange-400 text-white',
  '已結束': 'bg-white/60 text-gray-600',
}

// compact = 首頁小卡（方圖 + 名稱）
// full (default) = 活動探索大卡（16:9 + 日期地點）
export default function EventCard({ event, compact = false }: { event: Event; compact?: boolean }) {
  const badge = statusBadge[event.status] ?? 'bg-white/60 text-gray-600'
  const displayImage = event.coverImage || event.iconImage

  if (compact) {
    return (
      <Link href={`/events/${event.id}`}>
        <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col">
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-200 to-brand-500">
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayImage} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-4xl">🎉</div>
            )}
            {event.status && (
              <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>
                {event.status}
              </span>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-bold text-brand-900 text-sm leading-snug line-clamp-2">{event.name}</h3>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group h-full flex flex-col">

        {/* Image 1:1 */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-300 to-brand-600 flex-none">
          {displayImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImage}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-5xl">🎉</div>
          )}

          {/* Category tag */}
          {event.category && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              {event.category}
            </span>
          )}

          {/* Status badge */}
          {event.status && (
            <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
              {event.status}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-brand-900 text-[15px] leading-snug mb-3 line-clamp-2 group-hover:text-brand-700 transition-colors">
            {event.name}
          </h3>

          <div className="space-y-1.5 text-sm text-brand-400 mt-auto">
            {event.date && (
              <div className="flex items-center gap-2">
                <span className="flex-none">📅</span>
                <span>{formatDate(event.date)}{event.time ? `　${event.time}` : ''}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <span className="flex-none">📍</span>
                <span className="truncate">{event.location}</span>
              </div>
            )}
            {event.redeemPoints != null && (
              <div className="flex items-center gap-2">
                <span className="flex-none">🪙</span>
                <span className="text-amber-600 font-semibold">出席可集 {event.redeemPoints} 點</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
