'use client'

import { useState } from 'react'
import EventCalendar from './EventCalendar'
import EventsGrid from './EventsGrid'
import type { Event } from '@/lib/notion'

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00')
}

export default function EventsPageClient({ events }: { events: Event[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const monthEvents = events.filter(e => {
    const d = parseDate(e.date)
    return d && d.getFullYear() === year && d.getMonth() === month
  })

  return (
    <>
      <div className="mb-12">
        <EventCalendar
          events={events}
          onMonthChange={(y, m) => { setYear(y); setMonth(m) }}
        />
      </div>

      <h2 className="text-xl font-black text-white mb-6">
        {year} 年 {month + 1} 月活動
      </h2>
      <EventsGrid events={monthEvents} />
    </>
  )
}
