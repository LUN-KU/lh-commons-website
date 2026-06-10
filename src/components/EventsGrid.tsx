'use client'
import { useState } from 'react'
import EventCard from './EventCard'
import type { Event } from '@/lib/notion'

const TABS = ['全部', '報名中', '額滿', '已結束'] as const

export default function EventsGrid({ events }: { events: Event[] }) {
  const [active, setActive] = useState<string>('全部')

  const filtered = active === '全部'
    ? events
    : events.filter(e => e.status === active)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map(tab => {
          const count = tab === '全部' ? events.length : events.filter(e => e.status === tab).length
          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                active === tab
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'bg-white/15 text-white/70 hover:bg-white/25 hover:text-white'
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-xs ${active === tab ? 'text-brand-400' : 'text-white/40'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filtered.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-white/40 text-center py-20">此分類目前沒有活動</p>
      )}
    </div>
  )
}
