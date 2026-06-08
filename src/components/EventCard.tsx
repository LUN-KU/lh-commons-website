import Link from 'next/link'
import type { Event } from '@/lib/notion'

const statusColors: Record<string, string> = {
  '報名中': 'bg-emerald-100 text-emerald-700',
  '額滿': 'bg-orange-100 text-orange-600',
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-brand-100 hover:border-brand-300 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs text-brand-400 font-medium">{event.category}</span>
          {event.status && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
              {event.status}
            </span>
          )}
        </div>
        <h3 className="font-bold text-brand-800 text-base mb-3 flex-1 leading-snug">{event.name}</h3>
        <div className="space-y-1 text-sm text-brand-400">
          {event.date && (
            <p>📅 {formatDate(event.date)} {event.time}</p>
          )}
          {event.location && <p>📍 {event.location}</p>}
          {event.fee && <p>💰 {event.fee}</p>}
        </div>
      </div>
    </Link>
  )
}
