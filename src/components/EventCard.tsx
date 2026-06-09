import Link from 'next/link'
import type { Event } from '@/lib/notion'

const statusColors: Record<string, string> = {
  '報名中': 'bg-emerald-100 text-emerald-600',
  '額滿':   'bg-orange-100 text-orange-500',
  '已結束': 'bg-gray-100 text-gray-400',
}

const statusTopBar: Record<string, string> = {
  '報名中': 'bg-emerald-400',
  '額滿':   'bg-orange-400',
  '已結束': 'bg-gray-200',
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[d.getDay()]
  return `${month}/${day}（${weekday}）`
}

export default function EventCard({ event }: { event: Event }) {
  const statusColor = statusColors[event.status] ?? 'bg-gray-100 text-gray-400'
  const topBar = statusTopBar[event.status] ?? 'bg-brand-200'

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all border border-brand-50 h-full flex flex-col group">

        {/* Cover image OR color bar */}
        {event.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImage}
            alt={event.name}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`h-1.5 w-full ${topBar}`} />
        )}

        <div className="p-5 flex flex-col flex-1">
          {/* Category + Status */}
          <div className="flex items-start justify-between mb-3">
            {event.category ? (
              <span className="text-xs bg-brand-50 text-brand-500 font-medium px-3 py-1 rounded-full">
                {event.category}
              </span>
            ) : <span />}
            {event.status && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor}`}>
                {event.status}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-brand-800 text-base leading-snug group-hover:text-brand-900 transition-colors mb-auto">
            {event.name}
          </h3>

          {/* Meta */}
          <div className="space-y-1.5 text-sm text-brand-400 mt-4 pt-4 border-t border-brand-50">
            {event.date && (
              <p className="flex items-center gap-1.5">
                <span>📅</span>
                <span>{formatDate(event.date)}{event.time ? `　${event.time}` : ''}</span>
              </p>
            )}
            {event.location && (
              <p className="flex items-center gap-1.5">
                <span>📍</span>
                <span>{event.location}</span>
              </p>
            )}
            {event.fee && (
              <p className="flex items-center gap-1.5">
                <span>💰</span>
                <span>{event.fee}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
