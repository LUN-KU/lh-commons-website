'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Event } from '@/lib/notion'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00')
}

export default function EventCalendar({ events }: { events: Event[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const eventsThisMonth = events.filter(e => {
    const d = parseDate(e.date)
    return d && d.getFullYear() === year && d.getMonth() === month
  })

  const eventsByDay: Record<number, Event[]> = {}
  eventsThisMonth.forEach(e => {
    const d = parseDate(e.date)
    if (d) {
      const day = d.getDate()
      if (!eventsByDay[day]) eventsByDay[day] = []
      eventsByDay[day].push(e)
    }
  })

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : []

  function prevMonth() {
    setSelectedDay(null)
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    setSelectedDay(null)
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const statusDot: Record<string, string> = {
    '報名中': 'bg-green-400',
    '額滿': 'bg-orange-400',
    '已結束': 'bg-gray-300',
  }

  return (
    <div className="bg-white rounded-3xl border border-warm-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-warm-100 text-warm-600 transition-colors">‹</button>
        <h3 className="font-bold text-warm-800 text-lg">{year} 年 {month + 1} 月</h3>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-warm-100 text-warm-600 transition-colors">›</button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs text-warm-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const hasEvents = !!eventsByDay[day]
          const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
          const isSelected = selectedDay === day

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`flex flex-col items-center py-1.5 rounded-xl transition-colors
                ${isSelected ? 'bg-warm-600 text-white' : isToday ? 'bg-warm-100 text-warm-800' : 'hover:bg-warm-50 text-warm-700'}
              `}
            >
              <span className="text-sm font-medium">{day}</span>
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {eventsByDay[day].slice(0, 3).map((e, idx) => (
                    <span key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-warm-200' : (statusDot[e.status] ?? 'bg-warm-300')}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-warm-100 text-xs text-warm-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />報名中</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />額滿</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />已結束</span>
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="mt-4 pt-4 border-t border-warm-100">
          <p className="text-sm font-bold text-warm-700 mb-3">{month + 1}/{selectedDay} 的活動</p>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-warm-400">當天無活動</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map(e => (
                <Link key={e.id} href={`/events/${e.id}`} className="flex items-center justify-between bg-warm-50 rounded-xl px-4 py-2.5 hover:bg-warm-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-warm-800">{e.name}</p>
                    {e.time && <p className="text-xs text-warm-400 mt-0.5">{e.time}{e.location ? `・${e.location}` : ''}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-3 whitespace-nowrap ${
                    e.status === '報名中' ? 'bg-green-100 text-green-700' :
                    e.status === '額滿' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{e.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
