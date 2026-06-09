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

const statusColors: Record<string, string> = {
  '報名中': 'bg-green-100 text-green-700',
  '額滿':   'bg-orange-100 text-orange-700',
  '已結束': 'bg-gray-100 text-gray-500',
}

const statusTopBar: Record<string, string> = {
  '報名中': 'bg-emerald-400',
  '額滿':   'bg-orange-400',
  '已結束': 'bg-gray-200',
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, blocks] = await Promise.all([
    getEvent(params.id),
    getEventBlocks(params.id),
  ])
  if (!event) notFound()

  const statusColor = statusColors[event.status] ?? 'bg-gray-100 text-gray-500'
  const topBar = statusTopBar[event.status] ?? 'bg-brand-200'

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/events" className="text-sm text-brand-400 hover:text-brand-600 mb-6 inline-block transition-colors">
        ← 回到活動列表
      </Link>

      {/* Info card */}
      <div className="bg-white rounded-3xl shadow-sm border border-brand-50 overflow-hidden mb-6">
        {event.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImage} alt={event.name} className="w-full max-h-72 object-cover" />
        ) : (
          <div className={`h-1.5 w-full ${topBar}`} />
        )}
        <div className="p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-brand-400">{event.category}</span>
            {event.status && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor}`}>
                {event.status}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-brand-900 mb-6">{event.name}</h1>

          <div className="space-y-3 text-brand-600 mb-8">
            {event.date && (
              <div className="flex gap-3 items-start">
                <span className="w-6 flex-none">📅</span>
                <span>{formatDate(event.date)}{event.time && `　${event.time}`}</span>
              </div>
            )}
            {event.location && (
              <div className="flex gap-3 items-start">
                <span className="w-6 flex-none">📍</span>
                <span>{event.location}</span>
              </div>
            )}
            {event.fee && (
              <div className="flex gap-3 items-start">
                <span className="w-6 flex-none">💰</span>
                <span>{event.fee}</span>
              </div>
            )}
          </div>

          {event.registrationUrl && event.status === '報名中' ? (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-brand-700 text-white font-bold py-3.5 rounded-full hover:bg-brand-800 transition-colors shadow-md shadow-brand-200"
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

          <p className="text-center text-sm text-brand-300 mt-4">
            報名問題請私訊 IG{' '}
            <a href="https://www.instagram.com/l.h_commons" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-500 transition-colors">
              @l.h_commons
            </a>
          </p>
        </div>
      </div>

      {/* Notion page content */}
      {blocks.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-brand-50 p-8">
          <NotionBlocks blocks={blocks} />
        </div>
      )}
    </div>
  )
}
