import Link from 'next/link'
import type { Event } from '@/lib/notion'

const statusColors: Record<string, string> = {
  '報名中': 'bg-emerald-100 text-emerald-600',
  '額滿':   'bg-orange-100 text-orange-500',
  '已結束': 'bg-gray-100 text-gray-400',
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function EventCard({ event }: { event: Event }) {
  const statusColor = statusColors[event.status] ?? 'bg-gray-100 text-gray-400'

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-2xl p-5 hover:shadow-md transition-all border border-brand-50 h-full flex flex-col group">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs text-brand-300 font-medium">{event.category}</span>
          {event.status && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor}`}>
              {event.status}
            </span>
          )}
        </div>
        <h3 className="font-bold text-brand-700 text-base mb-3 flex-1 leading-snug group-hover:text-brand-900 transition-colors">{event.name}</h3>
        <div className="space-y-1.5 text-sm text-brand-300">
          {event.date && <p>📅 {formatDate(event.date)}{event.time ? `　${event.time}` : ''}</p>}
          {event.location && <p>📍 {event.location}</p>}
          {event.fee && <p>💰 {event.fee}</p>}
        </div>
      </div>
    </Link>
  )
}
