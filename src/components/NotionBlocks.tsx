import type { NotionBlock } from '@/lib/notion'

function richText(arr: any[]): string {
  if (!arr) return ''
  return arr.map((t: any) => t.plain_text).join('')
}

function RichText({ arr }: { arr: any[] }) {
  if (!arr) return null
  return (
    <>
      {arr.map((t: any, i: number) => {
        let node: React.ReactNode = t.plain_text
        if (t.annotations?.bold) node = <strong key={i}>{node}</strong>
        if (t.annotations?.italic) node = <em key={i}>{node}</em>
        if (t.annotations?.code) node = <code key={i} className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded text-sm font-mono">{node}</code>
        if (t.href) node = <a key={i} href={t.href} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline hover:text-brand-800">{node}</a>
        return <span key={i}>{node}</span>
      })}
    </>
  )
}

function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return null
}

export default function NotionBlocks({ blocks }: { blocks: NotionBlock[] }) {
  const elements: React.ReactNode[] = []
  let bulletBuffer: NotionBlock[] = []
  let numberedBuffer: NotionBlock[] = []

  function flushBullets() {
    if (bulletBuffer.length === 0) return
    elements.push(
      <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-1.5 text-brand-700 leading-relaxed">
        {bulletBuffer.map(b => (
          <li key={b.id}><RichText arr={b.bulleted_list_item?.rich_text} /></li>
        ))}
      </ul>
    )
    bulletBuffer = []
  }

  function flushNumbered() {
    if (numberedBuffer.length === 0) return
    elements.push(
      <ol key={`ol-${elements.length}`} className="list-decimal pl-6 space-y-1.5 text-brand-700 leading-relaxed">
        {numberedBuffer.map(b => (
          <li key={b.id}><RichText arr={b.numbered_list_item?.rich_text} /></li>
        ))}
      </ol>
    )
    numberedBuffer = []
  }

  for (const block of blocks) {
    if (block.type !== 'bulleted_list_item') flushBullets()
    if (block.type !== 'numbered_list_item') flushNumbered()

    switch (block.type) {
      case 'paragraph': {
        const text = richText(block.paragraph?.rich_text)
        if (!text.trim()) {
          elements.push(<div key={block.id} className="h-3" />)
        } else {
          elements.push(
            <p key={block.id} className="text-brand-700 leading-relaxed">
              <RichText arr={block.paragraph?.rich_text} />
            </p>
          )
        }
        break
      }

      case 'heading_1':
        elements.push(
          <h2 key={block.id} className="text-2xl font-black text-brand-900 mt-2">
            <RichText arr={block.heading_1?.rich_text} />
          </h2>
        )
        break

      case 'heading_2':
        elements.push(
          <h3 key={block.id} className="text-xl font-bold text-brand-800 mt-1">
            <RichText arr={block.heading_2?.rich_text} />
          </h3>
        )
        break

      case 'heading_3':
        elements.push(
          <h4 key={block.id} className="text-lg font-bold text-brand-700 mt-1">
            <RichText arr={block.heading_3?.rich_text} />
          </h4>
        )
        break

      case 'bulleted_list_item':
        bulletBuffer.push(block)
        break

      case 'numbered_list_item':
        numberedBuffer.push(block)
        break

      case 'quote':
        elements.push(
          <blockquote key={block.id} className="border-l-4 border-brand-300 pl-4 text-brand-500 italic">
            <RichText arr={block.quote?.rich_text} />
          </blockquote>
        )
        break

      case 'callout':
        elements.push(
          <div key={block.id} className="flex gap-3 bg-brand-50 border border-brand-100 rounded-xl p-4">
            <span>{block.callout?.icon?.emoji ?? 'ℹ️'}</span>
            <p className="text-brand-700 leading-relaxed">
              <RichText arr={block.callout?.rich_text} />
            </p>
          </div>
        )
        break

      case 'divider':
        elements.push(<hr key={block.id} className="border-brand-100" />)
        break

      case 'image': {
        const url = block.image?.type === 'external'
          ? block.image.external.url
          : block.image?.file?.url
        const caption = richText(block.image?.caption)
        if (url) {
          elements.push(
            <figure key={block.id} className="my-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={caption || '活動圖片'} className="w-full rounded-2xl object-cover" />
              {caption && <figcaption className="text-center text-sm text-brand-400 mt-2">{caption}</figcaption>}
            </figure>
          )
        }
        break
      }

      case 'video': {
        const url = block.video?.type === 'external'
          ? block.video.external.url
          : block.video?.file?.url
        if (url) {
          const embedUrl = youtubeEmbedUrl(url)
          if (embedUrl) {
            elements.push(
              <div key={block.id} className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="活動影片"
                />
              </div>
            )
          } else {
            elements.push(
              <video key={block.id} src={url} controls className="w-full rounded-2xl" />
            )
          }
        }
        break
      }

      default:
        break
    }
  }

  flushBullets()
  flushNumbered()

  return <div className="space-y-4">{elements}</div>
}
