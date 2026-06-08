import { getEvent, getEvents } from '@/lib/notion'
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
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

const statusColors: Record<string, string> = {
  '報名中': 'bg-green-100 text-green-700',
  '額滿': 'bg-orange-100 text-orange-700',
  '已結束': 'bg-gray-100 text-gray-500',
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id)
  if (!event) notFound()

  const statusColor = statusColors[event.status] ?? 'bg-gray-100 text-gray-500'

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/events" className="text-sm text-warm-500 hover:text-warm-700 mb-6 inline-block">
        ← 回到活動列表
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-warm-100 p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-warm-400">{event.category}</span>
          {event.status && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor}`}>
              {event.status}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-warm-800 mb-6">{event.name}</h1>

        <div className="space-y-3 text-warm-600 mb-8">
          {event.date && (
            <div className="flex gap-3">
              <span className="w-6">📅</span>
              <span>{formatDate(event.date)}{event.time && `　${event.time}`}</span>
            </div>
          )}
          {event.location && (
            <div className="flex gap-3">
              <span className="w-6">📍</span>
              <span>{event.location}</span>
            </div>
          )}
          {event.fee && (
            <div className="flex gap-3">
              <span className="w-6">💰</span>
              <span>{event.fee}</span>
            </div>
          )}
        </div>

        {event.registrationUrl && event.status === '報名中' ? (
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-warm-600 text-white font-bold py-3.5 rounded-full hover:bg-warm-700 transition-colors"
          >
            立即報名
          </a>
        ) : event.status === '額滿' ? (
          <div className="block w-full text-center bg-orange-100 text-orange-500 font-bold py-3.5 rounded-full">
            已額滿
          </div>
        ) : event.status === '已結束' ? (
          <div className="block w-full text-center bg-gray-100 text-gray-400 font-bold py-3.5 rounded-full">
            活動已結束
          </div>
        ) : null}

        <p className="text-center text-sm text-warm-400 mt-4">
          報名問題請私訊 IG <a href="https://www.instagram.com/l.h_commons" target="_blank" rel="noopener noreferrer" className="underline hover:text-warm-600">@l.h_commons</a>
        </p>
      </div>
    </div>
  )
}
